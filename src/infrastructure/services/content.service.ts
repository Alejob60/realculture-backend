import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from '../database/content.repository';
import { Content } from '../../domain/entities/content.entity';
import { UserRepository } from '../database/user.repository';

@Injectable()
export class ContentService {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(contentData: Partial<Content>): Promise<Content> {
    return this.contentRepository.create(contentData);
  }

  async findAll(): Promise<Content[]> {
    return this.contentRepository.findAll();
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne(id);
    if (!content)
      throw new NotFoundException(`Content with ID ${id} not found`);
    return content;
  }

  async update(id: string, updateData: Partial<Content>): Promise<Content> {
    const existing = await this.findOne(id);
    return this.contentRepository.update(existing.id, updateData);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    return this.contentRepository.delete(existing.id);
  }

  // ✅ Guarda un audio generado en la galería del usuario
  async saveAudioToGallery(params: {
    userId: string;
    script: string;
    mediaUrl: string;
  }): Promise<Content> {
    const { userId, script, mediaUrl } = params;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado para guardar audio');
    }

    return this.contentRepository.create({
      title: `Audio generado el ${new Date().toLocaleDateString()}`,
      description: script,
      mediaUrl,
      creator: user,
      type: 'audio',
    });
  }

  // ✅ Guarda cualquier contenido generado con tipo seguro
  async save(data: {
    userId: string;
    type: 'image' | 'audio' | 'video' | 'text' | 'other';
    prompt: string;
    url: string;
    duration?: number;
    status: string;
    createdAt: Date;
  }): Promise<void> {
    const user = await this.userRepository.findById(data.userId);

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado para guardar contenido',
      );
    }

    const content: Partial<Content> = {
      title: `${data.type} generado el ${data.createdAt.toLocaleDateString()}`,
      description: data.prompt,
      mediaUrl: data.url,
      duration: data.duration,
      type: data.type,
      creator: user,
      createdAt: data.createdAt,
    };

    await this.contentRepository.create(content);
  }
}
