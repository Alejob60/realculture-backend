import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MediaController } from '../../interfaces/controllers/media.controller';
import { PromoImageController } from '../../interfaces/controllers/promo-image.controller';
import { MediaBridgeService } from '../services/media-bridge.service';
import { GeneratedImageService } from '../services/generated-image.service';
import { GeneratedAudioService } from '../services/generated-audio.service';
import { AzureBlobService } from '../services/azure-blob.services';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from './user.module';
import { ContentModule } from './content.module';
import { forwardRef } from '@nestjs/common';
import { PromoImageService } from '../services/promo-image.service';
import { GeneratedAudioModule } from './generated-audio.module';

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
    ContentModule,
    forwardRef(() => UserModule), // Si hay dependencia circular, usar forwardRef
    GeneratedAudioModule,
  ],
  controllers: [MediaController, PromoImageController],
  providers: [
    MediaBridgeService, 
    GeneratedImageService, 
    GeneratedAudioService,
    AzureBlobService,
    PromoImageService,
  ],
  exports: [
    MediaBridgeService, 
    AzureBlobService, 
    GeneratedImageService,
    GeneratedAudioService,
    PromoImageService,
  ],
})
export class MediaModule {}