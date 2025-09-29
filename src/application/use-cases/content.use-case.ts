import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from '../../infrastructure/database/content.repository';
import { Content } from '../../domain/entities/content.entity';

@Injectable()
export class ContentUseCase {
  constructor(private readonly contentRepository: ContentRepository) {}

  create(contentData: Partial<Content>) {
    return this.contentRepository.create(contentData);
  }

  findAllByCreator(creatorId: string): Promise<Content[]> {
    return this.contentRepository.findByCreator(creatorId);
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne(id);
    if (!content)
      throw new NotFoundException(`Content with ID ${id} not found`);
    return content;
  }

  async update(id: string, updateData: Partial<Content>): Promise<Content> {
    await this.contentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    return this.contentRepository.delete(id);
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

  async registerGeneratedContent(data: {
    userId: string;
    type: string;
    prompt: string;
    url: string;
    duration?: number;
    status: string;
    createdAt: Date;
  }): Promise<Content> {
    // Extract blob path from the media URL
    const blobPath = this.extractBlobPathFromUrl(data.url);
    
    const content: Partial<Content> = {
      userId: data.userId,  // Use userId instead of creatorId
      type: data.type as 'image' | 'audio' | 'video' | 'text' | 'other',
      description: data.prompt,
      mediaUrl: data.url,
      filename: blobPath || undefined, // Use filename instead of blobPath
      duration: data.duration,
      status: data.status,
      createdAt: data.createdAt,
    };

    return this.contentRepository.create(content);
  }

}