// src/infrastructure/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../domain/entities/user.entity';
import { Content } from '../../domain/entities/content.entity';
import { GeneratedImageEntity } from '../../domain/entities/generated-image.entity';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { GeneratedMusicEntity } from '../../domain/entities/generated-music.entity';
import { Product } from '../../domain/entities/product.entity';
import { Creator } from '../../domain/entities/creator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      Content,
      GeneratedImageEntity,
      GeneratedAudioEntity,
      GeneratedVideoEntity,
      GeneratedMusicEntity,
      Product,
      Creator,
    ]),
  ],
  exports: [TypeOrmModule], // 👈 suficiente
})
export class DatabaseModule {}
