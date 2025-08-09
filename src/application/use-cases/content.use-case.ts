import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from '../../infrastructure/database/content.repository';
import { Content } from '../../domain/entities/content.entity';

@Injectable()
export class ContentUseCase {
  constructor(private readonly contentRepository: ContentRepository) {}

  create(contentData: Partial<Content>) {
    return this.contentRepository.create(contentData);
  }

  findAll(): Promise<Content[]> {
    return this.contentRepository.findAll();
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
  async registerGeneratedContent(data: {
    userId: string;
    type: string;
    prompt: string;
    url: string;
    duration?: number;
    status: string;
    createdAt: Date;
  }): Promise<Content> {
    const content: Partial<Content> = {
      creatorId: data.userId,  // CORRECCIÓN: usa creatorId, no userId
      type: data.type as 'image' | 'audio' | 'video' | 'text' | 'other',
      description: data.prompt,
      mediaUrl: data.url,
      duration: data.duration,
      status: data.status,
      createdAt: data.createdAt,
    };

    return this.contentRepository.create(content);
  }

}
