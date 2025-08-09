
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '../../domain/entities/content.entity';
import { Creator } from '../../domain/entities/creator.entity';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';
import { GeneratedImageEntity } from '../../domain/entities/generated-image.entity';
import { GeneratedMusicEntity } from '../../domain/entities/generated-music.entity';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { InfluencerEntity } from '../../domain/entities/influencer.entity';
import { Product } from '../../domain/entities/product.entity';
import { UserEntity } from '../../domain/entities/user.entity';
import { ContentRepository } from './content.repository';
import { InfluencerRepository } from './influencer.repository';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Content,
      Creator,
      GeneratedAudioEntity,
      GeneratedImageEntity,
      GeneratedMusicEntity,
      GeneratedVideoEntity,
      InfluencerEntity,
      Product,
      UserEntity,
    ]),
  ],
  providers: [ContentRepository, InfluencerRepository, UserRepository],
  exports: [ContentRepository, InfluencerRepository, UserRepository],
})
export class DatabaseModule {}
