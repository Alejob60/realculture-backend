import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';

@Injectable()
export class GeneratedVideoRepository {
  constructor(
    @InjectRepository(GeneratedVideoEntity)
    private readonly repository: Repository<GeneratedVideoEntity>,
  ) {}

  create(entity: Partial<GeneratedVideoEntity>): GeneratedVideoEntity {
    return this.repository.create(entity);
  }

  async save(entity: GeneratedVideoEntity): Promise<GeneratedVideoEntity> {
    return this.repository.save(entity);
  }

  async findAndCountByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: GeneratedVideoEntity[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { user: { id: userId } } as any,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(options: any): Promise<GeneratedVideoEntity | null> {
    return this.repository.findOne(options);
  }

  async find(options: any): Promise<GeneratedVideoEntity[]> {
    return this.repository.find(options);
  }

  async remove(entities: GeneratedVideoEntity[]): Promise<void> {
    await this.repository.remove(entities);
  }
}