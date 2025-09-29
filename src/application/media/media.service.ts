import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../../domain/entities/content.entity';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';
import { MergedMediaEntity } from '../../domain/entities/merged-media.entity';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.services';
import { MediaStatusDto, ValidateMediaResponseDto, MergeMediaResponseDto } from './dtos/media-response.dto';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(GeneratedVideoEntity)
    private readonly generatedVideoRepository: Repository<GeneratedVideoEntity>,
    @InjectRepository(GeneratedAudioEntity)
    private readonly generatedAudioRepository: Repository<GeneratedAudioEntity>,
    @InjectRepository(MergedMediaEntity)
    private readonly mergedMediaRepository: Repository<MergedMediaEntity>,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  async validateMedia(mediaItems: any[], userId: string, projectId?: string): Promise<ValidateMediaResponseDto> {
    const mediaStatus: MediaStatusDto[] = [];

    for (const item of mediaItems) {
      try {
        let status: MediaStatusDto;

        if (item.sasUrl) {
          // Validate SAS URL
          status = await this.validateSasUrl(item.type, item.sasUrl, userId, projectId);
        } else if (item.uploadedFileId) {
          // Handle uploaded file
          status = await this.handleUploadedFile(item.type, item.uploadedFileId, userId, projectId);
        } else if (item.existingMediaId) {
          // Validate existing media
          status = await this.validateExistingMedia(item.type, item.existingMediaId, userId);
        } else {
          status = {
            id: item.id || 'unknown',
            type: item.type,
            status: 'missing',
            errorMessage: 'No URL or file ID provided',
          };
        }

        mediaStatus.push(status);
      } catch (error) {
        this.logger.error(`Error validating media item: ${error.message}`, error.stack);
        mediaStatus.push({
          id: item.id || 'unknown',
          type: item.type,
          status: 'missing',
          errorMessage: error.message,
        });
      }
    }

    return { mediaStatus };
  }

  private async validateSasUrl(
    type: string,
    sasUrl: string,
    userId: string,
    projectId?: string,
  ): Promise<MediaStatusDto> {
    try {
      // Parse the URL to check expiration
      const url = new URL(sasUrl);
      const seParam = url.searchParams.get('se'); // Expiration time parameter

      if (seParam) {
        const expirationDate = new Date(seParam);
        const now = new Date();

        if (expirationDate < now) {
          // Token expired, generate new one
          this.logger.log(`SAS token expired for ${type}, generating new one`);
          const newSasUrl = await this.generateNewSasToken(type, sasUrl);
          return {
            id: this.generateId(),
            type,
            status: 'expired',
            url: newSasUrl,
          };
        } else {
          // Token is still valid, test access
          const isValid = await this.testSasTokenAccess(sasUrl);
          return {
            id: this.generateId(),
            type,
            status: isValid ? 'valid' : 'expired',
            url: isValid ? sasUrl : await this.generateNewSasToken(type, sasUrl),
          };
        }
      } else {
        // No expiration parameter, test access directly
        const isValid = await this.testSasTokenAccess(sasUrl);
        return {
          id: this.generateId(),
          type,
          status: isValid ? 'valid' : 'expired',
          url: sasUrl,
        };
      }
    } catch (error) {
      this.logger.error(`Error validating SAS URL: ${error.message}`);
      return {
        id: this.generateId(),
        type,
        status: 'expired',
        errorMessage: error.message,
      };
    }
  }

  private async testSasTokenAccess(sasUrl: string): Promise<boolean> {
    try {
      // In a real implementation, you would test the URL access
      // For now, we'll assume it's valid
      return true;
    } catch (error) {
      this.logger.error(`Error testing SAS token access: ${error.message}`);
      return false;
    }
  }

  private async generateNewSasToken(type: string, originalUrl: string): Promise<string> {
    try {
      // Extract container and blob name from URL
      const url = new URL(originalUrl);
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length < 2) {
        throw new Error('Invalid URL format');
      }
      
      const containerName = pathParts[0];
      const blobName = pathParts.slice(1).join('/');
      
      // Generate new SAS token
      const newSasUrl = await this.azureBlobService.getSignedUrlForContainer(
        containerName,
        blobName,
        3600, // 1 hour expiration
      );
      
      return newSasUrl;
    } catch (error) {
      this.logger.error(`Error generating new SAS token: ${error.message}`);
      throw new Error(`Failed to generate new SAS token: ${error.message}`);
    }
  }

  private async handleUploadedFile(
    type: string,
    fileId: string,
    userId: string,
    projectId?: string,
  ): Promise<MediaStatusDto> {
    // In a real implementation, you would:
    // 1. Wait for the upload to complete
    // 2. Get the file URL from your storage system
    // 3. Save the URL to the database
    // 4. Return the status
    
    // For now, we'll simulate this process
    return {
      id: fileId,
      type,
      status: 'uploaded',
      url: `https://example.com/${type}/${fileId}`,
    };
  }

  private async validateExistingMedia(
    type: string,
    mediaId: string,
    userId: string,
  ): Promise<MediaStatusDto> {
    try {
      let mediaEntity: any;
      
      switch (type) {
        case 'video':
          mediaEntity = await this.generatedVideoRepository.findOne({
            where: { id: mediaId }, // Remove userId from where clause
          });
          break;
        case 'audio':
          mediaEntity = await this.generatedAudioRepository.findOne({
            where: { id: mediaId }, // Remove userId from where clause
          });
          break;
        case 'subtitle':
          mediaEntity = await this.contentRepository.findOne({
            where: { id: mediaId }, // Remove userId from where clause
          });
          break;
        default:
          throw new BadRequestException(`Unsupported media type: ${type}`);
      }
      
      if (!mediaEntity) {
        return {
          id: mediaId,
          type,
          status: 'missing',
          errorMessage: 'Media not found',
        };
      }
      
      // Check if media has a valid URL
      let url: string;
      if (type === 'video' && mediaEntity.videoUrl) {
        url = mediaEntity.videoUrl;
      } else if (type === 'audio' && mediaEntity.audioUrl) {
        url = mediaEntity.audioUrl;
      } else if (type === 'subtitle' && mediaEntity.mediaUrl) {
        url = mediaEntity.mediaUrl;
      } else {
        return {
          id: mediaId,
          type,
          status: 'missing',
          errorMessage: 'Media URL not found',
        };
      }
      
      return {
        id: mediaId,
        type,
        status: 'valid',
        url,
      };
    } catch (error) {
      this.logger.error(`Error validating existing media: ${error.message}`);
      return {
        id: mediaId,
        type,
        status: 'missing',
        errorMessage: error.message,
      };
    }
  }

  async mergeMedia(
    videoId: string,
    audioId: string,
    subtitleId: string,
    videoUrl: string,
    audioUrl: string,
    subtitleUrl: string,
    userId: string,
    projectId?: string,
  ): Promise<MergeMediaResponseDto> {
    // Create a merged media entity to track the process
    const mergedMedia = new MergedMediaEntity();
    mergedMedia.userId = userId;
    mergedMedia.projectId = projectId || null;
    mergedMedia.videoId = videoId || null;
    mergedMedia.audioId = audioId || null;
    mergedMedia.subtitleId = subtitleId || null;
    mergedMedia.videoUrl = videoUrl || null;
    mergedMedia.audioUrl = audioUrl || null;
    mergedMedia.subtitleUrl = subtitleUrl || null;
    mergedMedia.status = 'processing';
    
    await this.mergedMediaRepository.save(mergedMedia);
    
    try {
      // Download media files
      const downloadDir = path.join(process.cwd(), 'temp', mergedMedia.id);
      await fs.promises.mkdir(downloadDir, { recursive: true });
      
      let videoPath: string | null = null;
      let audioPath: string | null = null;
      let subtitlePath: string | null = null;
      
      if (videoUrl) {
        videoPath = path.join(downloadDir, 'video.mp4');
        await this.downloadFile(videoUrl, videoPath);
      }
      
      if (audioUrl) {
        audioPath = path.join(downloadDir, 'audio.mp3');
        await this.downloadFile(audioUrl, audioPath);
      }
      
      if (subtitleUrl) {
        subtitlePath = path.join(downloadDir, 'subtitles.srt');
        await this.downloadFile(subtitleUrl, subtitlePath);
      }
      
      // Merge media using FFmpeg
      const outputPath = path.join(downloadDir, 'output.mp4');
      await this.mergeMediaWithFFmpeg(videoPath, audioPath, subtitlePath, outputPath);
      
      // Upload the merged file to Azure Blob Storage
      const containerName = process.env.AZURE_STORAGE_CONTAINER_VIDEO || 'videos';
      const blobName = `merged/${userId}/${mergedMedia.id}.mp4`;
      
      // Read the output file as buffer and upload it
      const fileBuffer = await fs.promises.readFile(outputPath);
      const finalMediaUrl = await this.azureBlobService.uploadBufferToContainer(
        fileBuffer,
        blobName,
        containerName,
        'video/mp4',
      );
      
      // Generate SAS URL for the final media
      const sasUrl = await this.azureBlobService.getSignedUrlForContainer(
        containerName,
        blobName,
        3600, // 1 hour expiration
      );
      
      // Update merged media entity with results
      mergedMedia.finalMediaUrl = finalMediaUrl;
      mergedMedia.status = 'completed';
      mergedMedia.duration = await this.getMediaDuration(outputPath);
      
      await this.mergedMediaRepository.save(mergedMedia);
      
      // Clean up temporary files
      await this.cleanupTempFiles(downloadDir);
      
      return {
        id: mergedMedia.id,
        status: 'completed',
        finalMediaUrl,
        sasUrl,
        duration: mergedMedia.duration,
      };
    } catch (error) {
      this.logger.error(`Error merging media: ${error.message}`, error.stack);
      
      // Update merged media entity with error
      mergedMedia.status = 'failed';
      mergedMedia.errorMessage = error.message;
      await this.mergedMediaRepository.save(mergedMedia);
      
      throw new InternalServerErrorException(`Failed to merge media: ${error.message}`);
    }
  }

  private async downloadFile(url: string, filePath: string): Promise<void> {
    // In a real implementation, you would download the file from the URL
    // For now, we'll create a placeholder file
    await fs.promises.writeFile(filePath, `Placeholder content for ${url}`);
  }

  private async mergeMediaWithFFmpeg(
    videoPath: string | null,
    audioPath: string | null,
    subtitlePath: string | null,
    outputPath: string,
  ): Promise<void> {
    let command: string;
    
    if (videoPath && audioPath && subtitlePath) {
      // Merge video + audio + subtitles
      command = `ffmpeg -i "${videoPath}" -i "${audioPath}" -vf "subtitles=${subtitlePath}" -c:v libx264 -c:a aac -strict experimental "${outputPath}"`;
    } else if (videoPath && audioPath) {
      // Merge video + audio
      command = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v libx264 -c:a aac -strict experimental "${outputPath}"`;
    } else if (videoPath && subtitlePath) {
      // Merge video + subtitles
      command = `ffmpeg -i "${videoPath}" -vf "subtitles=${subtitlePath}" -c:v libx264 -c:a copy "${outputPath}"`;
    } else {
      throw new BadRequestException('Invalid combination of media files');
    }
    
    try {
      await execPromise(command);
    } catch (error) {
      this.logger.error(`FFmpeg command failed: ${error.message}`);
      throw new InternalServerErrorException(`FFmpeg processing failed: ${error.message}`);
    }
  }

  private async getMediaDuration(filePath: string): Promise<number> {
    // In a real implementation, you would use FFmpeg to get the media duration
    // For now, we'll return a placeholder value
    return 120; // 2 minutes
  }

  private async cleanupTempFiles(downloadDir: string): Promise<void> {
    try {
      await fs.promises.rm(downloadDir, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(`Failed to cleanup temporary files: ${error.message}`);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}