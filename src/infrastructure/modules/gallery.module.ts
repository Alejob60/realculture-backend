import { Module } from '@nestjs/common';
import { GalleryController } from '../../interfaces/controllers/gallery.controller';
import { GalleryService } from '../services/gallery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedImageEntity } from '../../domain/entities/generated-image.entity';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';
import { UserModule } from './user.module';
import { AzureBlobModule } from './azure-blob.module';
import { Content } from '../../domain/entities/content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedImageEntity, GeneratedVideoEntity, GeneratedAudioEntity, Content]),
    UserModule,
    AzureBlobModule,
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}