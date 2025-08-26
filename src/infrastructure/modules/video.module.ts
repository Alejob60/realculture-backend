import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // Importar HttpModule
import { VideoController } from '../../interfaces/controllers/video.controller';
import { VideoService } from '../services/video.service';
import { UserModule } from './user.module';
import { ConfigModule } from '@nestjs/config';
import { GeneratedVideoEntity } from 'src/domain/entities/generated-video.entity';
import { AiModule } from './ai.module';
import { AzureBlobModule } from './azure-blob.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedVideoEntity]),
    HttpModule,
    UserModule,
    ConfigModule,
    AiModule, // Re-añadir AiModule
    AzureBlobModule,
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}


