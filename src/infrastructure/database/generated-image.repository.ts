
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsWhere } from 'typeorm';
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

  remove(images: GeneratedImageEntity[]): Promise<GeneratedImageEntity[]> {
    return this.repo.remove(images);
  }
}
