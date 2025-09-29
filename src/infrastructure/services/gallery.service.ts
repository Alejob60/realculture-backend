import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { Content } from '../../domain/entities/content.entity';
import { AzureBlobService } from './azure-blob.services';
import { GeneratedImageEntity } from '../../domain/entities/generated-image.entity';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(GeneratedImageEntity)
    private readonly generatedImageRepository: Repository<GeneratedImageEntity>,
    @InjectRepository(GeneratedVideoEntity)
    private readonly generatedVideoRepository: Repository<GeneratedVideoEntity>,
    @InjectRepository(GeneratedAudioEntity)
    private readonly generatedAudioRepository: Repository<GeneratedAudioEntity>,
    private readonly azureBlobService: AzureBlobService,
  ) {
  }

  /**
   * Obtiene la galería del usuario combinando datos de todas las tablas relevantes.
   */
  async getUserGallery(userId: string): Promise<
    {
      id: string;
      title: string;
      description: string;
      type: string;
      createdAt: Date;
      sasUrl: string | null;
      previewUrl: string | null;
      duration?: number;
      audioUrl?: string;
      audioDuration?: number;
      audioVoice?: string;
    }[]
  > {
    // Validate userId
    if (!userId) {
      this.logger.error('User ID is undefined or null');
      throw new BadRequestException('User ID is required');
    }
    
    this.logger.log(`Consultando galería para el usuario: ${userId}`);

    // Get content from contents table - most permissive query to ensure we get data
    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .where('(content.userId = :userId OR content.creatorUserId = :userId)', { userId })
      .andWhere('(content.expiresAt > :now OR content.expiresAt IS NULL)', { now: new Date() })
      .orderBy('content.createdAt', 'DESC')
      .limit(20) // Limit to 20 items to avoid overloading
      .getMany();

    // Get content from generated_images table - most permissive query
    const generatedImages = await this.generatedImageRepository.find({
      where: [
        {
          user: { userId: userId },
          // Only get non-expired content (expiresAt is null or in the future)
          expiresAt: MoreThan(new Date()),
        },
        {
          user: { userId: userId },
          // Also get content with no expiration date
          expiresAt: IsNull(),
        }
      ],
      order: { createdAt: 'DESC' },
      relations: ['user'],
      take: 20 // Limit to 20 items
    });

    // Get content from generated_videos table - most permissive query
    const generatedVideos = await this.generatedVideoRepository.find({
      where: {
        user: { userId: userId },
      },
      order: { createdAt: 'DESC' },
      relations: ['user'],
      take: 20 // Limit to 20 items
    });

    // Get content from generated_audios table - most permissive query
    const generatedAudios = await this.generatedAudioRepository
      .createQueryBuilder('generatedAudio')
      .where('generatedAudio.userId = :userId', { userId })
      .orderBy('generatedAudio.createdAt', 'DESC')
      .limit(20) // Limit to 20 items
      .getMany();

    this.logger.log(`Found ${contents.length} content items, ${generatedImages.length} generated images, ${generatedVideos.length} generated videos, and ${generatedAudios.length} generated audios for user ${userId}`);

    // Combine and format all content
    const allItems: any[] = [];

    // Process content from contents table
    for (const item of contents) {
      allItems.push({
        id: item.id,
        title: item.title || `Content generado el ${item.createdAt.toLocaleDateString()}`,
        description: item.description || item.prompt || '',
        type: item.type || 'other',
        createdAt: item.createdAt,
        duration: item.duration,
        audioUrl: item.audioUrl,
        audioDuration: item.audioDuration,
        audioVoice: item.audioVoice,
        sasUrl: item.mediaUrl || null,
        previewUrl: null, // Will be generated below
      });
    }

    // Process content from generated_images table
    for (const item of generatedImages) {
      allItems.push({
        id: item.id,
        title: `Imagen generada el ${item.createdAt.toLocaleDateString()}`,
        description: item.prompt || '',
        type: 'image',
        createdAt: item.createdAt,
        sasUrl: item.imageUrl || null,
        previewUrl: null, // Will be generated below
      });
    }

    // Process content from generated_videos table
    for (const item of generatedVideos) {
      allItems.push({
        id: item.id,
        title: `Video generado el ${item.createdAt.toLocaleDateString()}`,
        description: item.script || (item.prompt ? JSON.stringify(item.prompt) : '') || '',
        type: 'video',
        createdAt: item.createdAt,
        duration: null, // Video duration not stored in this entity
        sasUrl: item.videoUrl || null,
        previewUrl: null, // Will be generated below
      });
    }

    // Process content from generated_audios table
    for (const item of generatedAudios) {
      allItems.push({
        id: item.id,
        title: `Audio generado el ${item.createdAt.toLocaleDateString()}`,
        description: item.prompt || '',
        type: 'audio',
        createdAt: item.createdAt,
        sasUrl: item.audioUrl || null,
        previewUrl: null, // Will be generated below
      });
    }

    // Sort all items by creation date (newest first)
    allItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Take only the first 20 items to avoid overloading the frontend
    const limitedItems = allItems.slice(0, 20);

    // Generate SAS URLs and preview URLs for all items
    const result = await Promise.all(
      limitedItems.map(async (item) => {
        let sasUrl: string | null = item.sasUrl;
        let previewUrl: string | null = item.previewUrl;

        // If the mediaUrl already contains a SAS URL, use it directly
        if (sasUrl && sasUrl.includes('?')) {
          // Already has SAS token
          this.logger.log(`Using existing SAS URL for content ${item.id}`);
        } else if (sasUrl) {
          // If it's just a blob path, generate a new SAS URL
          try {
            const containerName = this.getContainerNameByType(item.type);
            const blobPath = this.extractBlobPathFromUrl(sasUrl) || sasUrl;
              
            // Check if blob exists before generating SAS URL
            const blobExists = await this.azureBlobService.blobExists(containerName, blobPath);
            if (blobExists) {
              sasUrl = await this.azureBlobService.getSignedUrlForContainer(
                containerName,
                blobPath,
                3600, // 1 hour expiration
              );
              this.logger.log(`Generated SAS URL for ${item.type} content: ${blobPath}`);
            } else {
              this.logger.warn(`Blob not found for content ${item.id}: ${containerName}/${blobPath}`);
              sasUrl = null; // Set to null if blob doesn't exist
            }
          } catch (error) {
            this.logger.error(`Error generating SAS URL for content ${item.id}:`, error);
            sasUrl = null; // Set to null on error
          }
        }

        // Try to generate preview URL if needed
        if (item.sasUrl) {
          try {
            const containerName = this.getContainerNameByType(item.type);
            const blobPath = this.extractBlobPathFromUrl(item.sasUrl) || item.sasUrl;
            const previewPath = `thumbnails/${blobPath}`;
            const previewExists = await this.azureBlobService.blobExists(containerName, previewPath);
            if (previewExists) {
              previewUrl = await this.azureBlobService.getSignedUrlForContainer(
                containerName,
                previewPath,
                3600, // 1 hour expiration
              );
              this.logger.log(`Generated preview URL for ${item.type} content: ${previewPath}`);
            } else {
              this.logger.debug(`Preview not found for content ${item.id}: ${containerName}/${previewPath}`);
            }
          } catch (error) {
            this.logger.error(`Error generating preview URL for content ${item.id}:`, error);
          }
        }

        return {
          ...item,
          sasUrl,
          previewUrl,
        };
      })
    );

    this.logger.log(`Gallery data prepared for user ${userId}. Returning ${result.length} items`);
    return result;
  }
  
  /**
   * Extracts the blob path from an Azure Blob URL
   * @param url The full Azure Blob URL
   * @returns The blob path or null if not a valid Azure Blob URL
   */
  private extractBlobPathFromUrl(url: string): string | null {
    if (!url) return null;
      
    try {
      const urlObj = new URL(url);
      // Azure Blob URLs have the format: https://account.blob.core.windows.net/container/blob-path
      // We want to extract the blob-path part
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        
      // The blob path is everything after the container name (second part)
      if (pathParts.length >= 2) {
        // Remove the first two parts (empty string and container name) and join the rest
        return pathParts.slice(1).join('/');
      }
        
      return null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Obtiene el nombre del contenedor según el tipo de contenido.
   */
  private getContainerNameByType(type: string): string {
    // These should be injected or configured properly
    const config = {
      images: process.env.AZURE_STORAGE_CONTAINER_IMAGES || 'images',
      videos: process.env.AZURE_STORAGE_CONTAINER_VIDEO || 'videos',
      audio: process.env.AZURE_STORAGE_CONTAINER_AUDIO || 'audio',
      default: process.env.AZURE_BLOB_CONTAINER || 'media',
    };

    switch (type) {
      case 'image':
        return config.images;
      case 'video':
        return config.videos;
      case 'audio':
        return config.audio;
      default:
        return config.default;
    }
  }
}