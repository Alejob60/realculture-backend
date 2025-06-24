import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedImageEntity } from 'src/domain/entities/generated-image.entity';
import { GeneratedImageService } from '../services/generated-image.service';
import { UserEntity } from 'src/domain/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeneratedImageEntity, UserEntity])],
  providers: [GeneratedImageService],
  exports: [GeneratedImageService],
})
export class GeneratedImageModule {}
