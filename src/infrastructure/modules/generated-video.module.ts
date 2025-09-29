import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { GeneratedVideoService } from '../services/generated-video.service';
import { GeneratedVideoRepository } from '../database/generated-video.repository';
import { UserModule } from './user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedVideoEntity]),
    UserModule,
  ],
  providers: [GeneratedVideoService, GeneratedVideoRepository],
  exports: [GeneratedVideoService],
})
export class GeneratedVideoModule {}