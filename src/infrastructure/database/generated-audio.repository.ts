import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';

@Injectable()
export class GeneratedAudioRepository {
  constructor(
    @InjectRepository(GeneratedAudioEntity)
    private readonly repository: Repository<GeneratedAudioEntity>,
  ) {}

  create(entity: Partial<GeneratedAudioEntity>): GeneratedAudioEntity {
    return this.repository.create(entity);
  }

  async save(entity: GeneratedAudioEntity): Promise<GeneratedAudioEntity> {
    return this.repository.save(entity);
  }

  async findAndCountByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: GeneratedAudioEntity[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { user: { id: userId } } as any,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async find(options: any): Promise<GeneratedAudioEntity[]> {
    return this.repository.find(options);
  }

  async remove(entities: GeneratedAudioEntity[]): Promise<void> {
    await this.repository.remove(entities);
  }
}