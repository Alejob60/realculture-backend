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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ContentService } from '../../infrastructure/services/content.service';
import { Content } from '../../domain/entities/content.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UserEntity } from '../../domain/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('content')
@Controller('content')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new content' })
  @ApiBody({ type: Content })
  @ApiResponse({ status: 201, description: 'Content created successfully.', type: Content })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(
    @Body() body: Partial<Content>,
    @Req() req: Request,
  ): Promise<Content> {
    const user = req.user as UserEntity;
    return this.contentService.create({ ...body, creator: user });
  }

  @Get()
  @ApiOperation({ summary: 'Get all content' })
  @ApiResponse({ status: 200, description: 'Returns all content.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.contentService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Returns the content.', type: Content })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Content not found.' })
  async findById(@Param('id') id: string): Promise<Content> {
    return this.contentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Content ID' })
  @ApiBody({ type: Content })
  @ApiResponse({ status: 200, description: 'Content updated successfully.', type: Content })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Content not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Content>,
  ): Promise<Content> {
    return this.contentService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Content not found.' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.contentService.remove(id);
  }
}