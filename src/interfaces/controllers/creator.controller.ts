import { Controller, Post, Body, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreatorService } from '../../infrastructure/services/creator.service';
import { CreateCreatorDto } from '../dto/create-creator.dto';

@ApiTags('creators')
@Controller('creators')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new creator' })
  @ApiBody({ type: CreateCreatorDto })
  @ApiResponse({ status: 201, description: 'Creator created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() dto: CreateCreatorDto) {
    return this.creatorService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all creators' })
  @ApiResponse({ status: 200, description: 'Returns all creators.' })
  findAll() {
    return this.creatorService.findAll();
  }
}