import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';
import { GeneratedAudioService } from '../services/generated-audio.service';
import { GeneratedAudioRepository } from '../database/generated-audio.repository';
import { UserModule } from './user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedAudioEntity]),
    UserModule,
  ],
  providers: [GeneratedAudioService, GeneratedAudioRepository],
  exports: [GeneratedAudioService],
})
export class GeneratedAudioModule {}