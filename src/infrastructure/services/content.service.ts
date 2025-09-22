import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContentRepository } from '../database/content.repository';
import { Content } from '../../domain/entities/content.entity';
import { UserRepository } from '../database/user.repository';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(contentData: Partial<Content>): Promise<Content> {
    this.logger.log(`Creating content for user: ${contentData.userId}`);
    return this.contentRepository.create(contentData);
  }

  async findAll(paginationDto: PaginationDto) {
    this.logger.log('Finding all content with pagination');
    const { page = 1, limit = 10 } = paginationDto;
    const { data, total } = await this.contentRepository.findAll(page, limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Content> {
    this.logger.log(`Finding content with id: ${id}`);
    const content = await this.contentRepository.findOne(id);
    if (!content) {
      this.logger.warn(`Content with id ${id} not found`);
      throw new NotFoundException(`Contenido con ID ${id} no encontrado`);
    }
    return content;
  }

  async update(id: string, updateData: Partial<Content>): Promise<Content> {
    this.logger.log(`Updating content with id: ${id}`);
    const existing = await this.findOne(id);
    return this.contentRepository.update(existing.id, updateData);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing content with id: ${id}`);
    const existing = await this.findOne(id);
    await this.contentRepository.delete(existing.id);
  }

  async saveAudioToGallery(params: {
    userId: string;
    script: string;
    mediaUrl: string;
  }): Promise<Content> {
    this.logger.log(`Saving audio to gallery for user: ${params.userId}`);
    const { userId, script, mediaUrl } = params;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      this.logger.warn(`User not found for saving audio: ${userId}`);
      throw new NotFoundException('Usuario no encontrado para guardar audio');
    }

    // Extract blob path from the media URL
    const blobPath = this.extractBlobPathFromUrl(mediaUrl);

    return this.contentRepository.create({
      title: `Audio generado el ${new Date().toLocaleDateString()}`,
      description: script,
      mediaUrl,
      filename: blobPath || undefined, // Use filename instead of blobPath
      creator: user,
      type: 'audio',
    });
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

  async save(data: {
    userId: string;
    type: 'image' | 'audio' | 'video' | 'text' | 'other';
    prompt: string;
    url: string;
    duration?: number;
    status: string;
    createdAt: Date;
  }): Promise<void> {
    this.logger.log(`Saving content of type ${data.type} for user: ${data.userId}`);
    const user = await this.userRepository.findById(data.userId);

    if (!user) {
      this.logger.warn(`User not found for saving content: ${data.userId}`);
      throw new NotFoundException('Usuario no encontrado para guardar contenido');
    }

    // Extract blob path from the media URL
    const blobPath = this.extractBlobPathFromUrl(data.url);

    const content: Partial<Content> = {
      title: `${data.type} generado el ${data.createdAt.toLocaleDateString()}`,
      description: data.prompt,
      mediaUrl: data.url,
      filename: blobPath || undefined, // Use filename instead of blobPath
      duration: data.duration,
      type: data.type,
      creator: user,
      createdAt: data.createdAt,
    };

    await this.contentRepository.create(content);
  }
}