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
import { Creator } from 'src/domain/entities/creator.entity';

// Agrega aquí otras entidades según las uses en repositorios
// import { OtraEntidad } from '../../domain/entities/otra-entidad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      Content,
      GeneratedImageEntity,
      Content,
      Creator,
      GeneratedImageEntity,
      GeneratedAudioEntity,
      GeneratedVideoEntity,
      GeneratedMusicEntity,
      Product,
       
        

      
    ]),
  ],
  exports: [
    TypeOrmModule,
    UserEntity,
      Content,
      GeneratedImageEntity,
      Content,
      Creator,
      GeneratedImageEntity,
      GeneratedAudioEntity,
      GeneratedVideoEntity,
      GeneratedMusicEntity,
      Product, // Exportamos para que los repositorios puedan usar el InjectRepository
  ],
})
export class DatabaseModule {}
