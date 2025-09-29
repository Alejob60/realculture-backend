import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedImageEntity } from 'src/domain/entities/generated-image.entity';
import { GeneratedImageService } from '../services/generated-image.service';
import { UserEntity } from 'src/domain/entities/user.entity';
import { DatabaseModule } from '../database/database.module';
import { HttpModule } from '@nestjs/axios';
import { MediaController } from '../../interfaces/controllers/media.controller';
import { PromoImageController } from '../../interfaces/controllers/promo-image.controller';
import { MediaBridgeService } from '../services/media-bridge.service';
import { AzureBlobService } from '../services/azure-blob.services';


@Module({
  imports: [
    DatabaseModule,
    HttpModule,
  ],
  controllers: [MediaController, PromoImageController],
  providers: [MediaBridgeService, AzureBlobService],
  exports: [AzureBlobService],
})
export class MediaModule {}

