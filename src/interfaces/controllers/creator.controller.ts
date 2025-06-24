// src/interfaces/controllers/creator.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreatorService } from '../../infrastructure/services/creator.service';
import { CreateCreatorDto } from '../dto/create-creator.dto';

@Controller('creators')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Post()
  create(@Body() dto: CreateCreatorDto) {
    return this.creatorService.create(dto);
  }

  @Get()
  findAll() {
    return this.creatorService.findAll();
  }
}
