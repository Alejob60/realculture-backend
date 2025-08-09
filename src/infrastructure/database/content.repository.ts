import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from '../../domain/entities/content.entity';

@Injectable()
export class ContentRepository {
  constructor(
    @InjectRepository(Content)
    private readonly repo: Repository<Content>,
  ) {}

  async create(content: Partial<Content>): Promise<Content> {
    return this.repo.save(content);
  }

  async findAll(): Promise<Content[]> {
    return this.repo.find({ relations: ['creator'] });
  }

  async findOne(userId: string): Promise<Content | null> {
    return this.repo.findOne({ where: { userId }, relations: ['creator'] });
  }

  async findByCreator(creatorId: string): Promise<Content[]> {
    return this.repo.find({
      where: { creator: { userId: creatorId } },
      relations: ['creator'],
    });
  }

  async update(id: string, updateData: Partial<Content>): Promise<Content> {
    await this.repo.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated)
      throw new Error(`Content with ID ${id} not found after update.`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
