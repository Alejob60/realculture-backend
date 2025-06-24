import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { InfluencerRepository } from '../../infrastructure/database/influencer.repository';
import { InfluencerEntity } from '../../domain/entities/influencer.entity';

@Controller('influencers')
export class InfluencerController {
  constructor(private readonly repo: InfluencerRepository) {}

  @Post()
  async create(@Body() body: Partial<InfluencerEntity>) {
    return this.repo.create(body);
  }

  @Get()
  async findAll(): Promise<InfluencerEntity[]> {
    return this.repo.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<InfluencerEntity | null> {
    return this.repo.findById(id);
  }
}
