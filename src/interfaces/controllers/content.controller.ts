import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { ContentService } from '../../infrastructure/services/content.service';
import { Content } from '../../domain/entities/content.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UserEntity } from '../../domain/entities/user.entity';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  async create(
    @Body() body: Partial<Content>,
    @Req() req: Request,
  ): Promise<Content> {
    const user = req.user as UserEntity;
    return this.contentService.create({ ...body, creator: user });
  }

  @Get()
  async findAll(): Promise<Content[]> {
    return this.contentService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Content> {
    return this.contentService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Content>,
  ): Promise<Content> {
    return this.contentService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.contentService.remove(id);
  }
}
