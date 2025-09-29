// src/infrastructure/services/influencer.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfluencerEntity } from '../../domain/entities/influencer.entity';

@Injectable()
export class InfluencerService {
  constructor(
    @InjectRepository(InfluencerEntity)
    private readonly influencerRepo: Repository<InfluencerEntity>,
  ) {}

  async findAll(): Promise<InfluencerEntity[]> {
    return this.influencerRepo.find();
  }

  async findById(userId: string): Promise<InfluencerEntity> {
    const influencer = await this.influencerRepo.findOne({ where: { userId } });
    if (!influencer) {
      throw new NotFoundException(`Influencer con id ${userId} no encontrado`);
    }
    return influencer;
  }

  async create(data: Partial<InfluencerEntity>): Promise<InfluencerEntity> {
    const influencer = this.influencerRepo.create(data);
    return this.influencerRepo.save(influencer);
  }

  async update(userId: string, data: Partial<InfluencerEntity>): Promise<InfluencerEntity> {
    const influencer = await this.findById(userId);
    Object.assign(influencer, data);
    return this.influencerRepo.save(influencer);
  }

  async remove(userId: string): Promise<void> {
    const influencer = await this.findById(userId);
    await this.influencerRepo.remove(influencer);
  }
}
