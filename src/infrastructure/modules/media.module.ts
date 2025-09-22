import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MediaController } from '../../interfaces/controllers/media.controller';
import { PromoImageController } from '../../interfaces/controllers/promo-image.controller';
import { MediaBridgeService } from '../services/media-bridge.service';
import { GeneratedImageService } from '../services/generated-image.service';
import { AzureBlobService } from '../services/azure-blob.services';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from './user.module';
import { ContentModule } from './content.module';
import { forwardRef } from '@nestjs/common';
import { PromoImageService } from '../services/promo-image.service';

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
    ContentModule,
    forwardRef(() => UserModule), // Si hay dependencia circular, usar forwardRef
  ],
  controllers: [MediaController, PromoImageController],
  providers: [
    MediaBridgeService, 
    GeneratedImageService, 
    AzureBlobService,
    PromoImageService,
  ],
  exports: [
    MediaBridgeService, 
    AzureBlobService, 
    GeneratedImageService,
    PromoImageService,
  ],
})
export class MediaModule {}