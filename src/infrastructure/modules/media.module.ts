// src/infrastructure/modules/media.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // 👈 importar esto
import { MediaController } from '../../interfaces/controllers/media.controller';
import { PromoImageController } from '../../interfaces/controllers/promo-image.controller';
import { MediaBridgeService } from '../services/media-bridge.service';
import { GeneratedImageService } from '../services/generated-image.service';
import { AzureBlobService } from '../services/azure-blob.services';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    HttpModule, // 👈 agregar aquí para que HttpService esté disponible
  ],
  controllers: [MediaController, PromoImageController],
  providers: [MediaBridgeService, GeneratedImageService, AzureBlobService],
  exports: [AzureBlobService],
})
export class MediaModule {}
