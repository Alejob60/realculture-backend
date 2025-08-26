
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, MoreThan } from 'typeorm';
import { GeneratedImageEntity } from '../../domain/entities/generated-image.entity';

@Injectable()
export class GeneratedImageRepository {
  constructor(
    @InjectRepository(GeneratedImageEntity)
    private readonly repo: Repository<GeneratedImageEntity>,
  ) {}

  create(data: Partial<GeneratedImageEntity>): GeneratedImageEntity {
    return this.repo.create(data);
  }

  save(image: GeneratedImageEntity): Promise<GeneratedImageEntity> {
    return this.repo.save(image);
  }

  find(options?: FindManyOptions<GeneratedImageEntity>): Promise<GeneratedImageEntity[]> {
    return this.repo.find(options);
  }

  async findAndCountByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: GeneratedImageEntity[]; total: number }> {
    const [data, total] = await this.repo.findAndCount({
      where: {
        user: { userId },
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  remove(images: GeneratedImageEntity[]): Promise<GeneratedImageEntity[]> {
    return this.repo.remove(images);
  }
}
