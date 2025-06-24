import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfluencerEntity } from '../../domain/entities/influencer.entity';

@Injectable()
export class InfluencerRepository {
  constructor(
    @InjectRepository(InfluencerEntity)
    private readonly repo: Repository<InfluencerEntity>,
  ) {}

  async create(data: Partial<InfluencerEntity>): Promise<InfluencerEntity> {
    return this.repo.save(data);
  }

  async findAll(): Promise<InfluencerEntity[]> {
    return this.repo.find({ relations: ['products'] });
  }

  async findById(id: string): Promise<InfluencerEntity | null> {
    return this.repo.findOne({ where: { id }, relations: ['products'] });
  }
}
