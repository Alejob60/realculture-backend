import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '../../domain/entities/content.entity';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';
import { MergedMediaEntity } from '../../domain/entities/merged-media.entity';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Content,
      GeneratedVideoEntity,
      GeneratedAudioEntity,
      MergedMediaEntity,
    ]),
  ],
  controllers: [MediaController],
  providers: [MediaService, AzureBlobService],
  exports: [MediaService],
})
export class MediaProcessingModule {}