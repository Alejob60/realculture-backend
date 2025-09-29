//
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // Importar HttpModule
import { VideoController } from '../../interfaces/controllers/video.controller';
import { VideoService } from '../services/video.service';
import { UserModule } from './user.module';
import { ConfigModule } from '@nestjs/config';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { AiModule } from './ai.module';
import { AzureBlobModule } from './azure-blob.module';
import { MediaModule } from './media.module';
import { UserService } from '../services/user.service';
import { AzureBlobService } from '../services/azure-blob.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedVideoEntity]),
    HttpModule,
    UserModule,
    ConfigModule,
    AiModule, // Re-añadir AiModule
    AzureBlobModule,
    MediaModule,
  ],
  controllers: [VideoController],
  providers: [VideoService, UserService, AzureBlobService],
})
export class VideoModule {}


