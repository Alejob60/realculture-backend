import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { InfluencerRepository } from '../../infrastructure/database/influencer.repository';
import { InfluencerEntity } from '../../domain/entities/influencer.entity';

@ApiTags('influencers')
@Controller('influencers')
export class InfluencerController {
  constructor(private readonly repo: InfluencerRepository) {}

  @Post()
  @ApiOperation({ summary: 'Create a new influencer' })
  @ApiBody({ type: InfluencerEntity })
  @ApiResponse({ status: 201, description: 'Influencer created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() body: Partial<InfluencerEntity>) {
    return this.repo.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all influencers' })
  @ApiResponse({ status: 200, description: 'Returns all influencers.' })
  async findAll(): Promise<InfluencerEntity[]> {
    return this.repo.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get influencer by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Influencer ID' })
  @ApiResponse({ status: 200, description: 'Returns the influencer.' })
  @ApiResponse({ status: 404, description: 'Influencer not found.' })
  async findById(@Param('id') id: string): Promise<InfluencerEntity | null> {
    return this.repo.findById(id);
  }
}