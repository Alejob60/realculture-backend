// src/infrastructure/modules/content.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '../../domain/entities/content.entity';
import { UserEntity } from '../../domain/entities/user.entity';
import { ContentService } from '../services/content.service';
import { ContentRepository } from '../database/content.repository';
import { UserRepository } from '../database/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Content, UserEntity])],
  providers: [ContentService, ContentRepository, UserRepository],
  exports: [ContentService],
})
export class ContentModule {}
