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
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ContentService } from '../../infrastructure/services/content.service';
import { Content } from '../../domain/entities/content.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UserEntity } from '../../domain/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
  async findAll(@Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.contentService.findAll(paginationDto);
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
