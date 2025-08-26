import { Module } from '@nestjs/common';
import { GalleryController } from '../../interfaces/controllers/gallery.controller';
import { GalleryService } from '../services/gallery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedImageEntity } from 'src/domain/entities/generated-image.entity';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { UserModule } from './user.module';
import { AzureBlobModule } from './azure-blob.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedImageEntity, GeneratedVideoEntity]),
    UserModule,
    AzureBlobModule,
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
