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

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Content[]; total: number }> {
    const [data, total] = await this.repo.findAndCount({
      relations: ['creator'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    return { data, total };
  }

  async findOne(id: string): Promise<Content | null> {
    return this.repo.findOne({ where: { id }, relations: ['creator'] });
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
