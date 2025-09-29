import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { UserEntity } from '../../domain/entities/user.entity';
import { Content } from '../../domain/entities/content.entity';
import { Creator } from '../../domain/entities/creator.entity';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';
import { GeneratedImageEntity } from '../../domain/entities/generated-image.entity';
import { GeneratedMusicEntity } from '../../domain/entities/generated-music.entity';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { InfluencerEntity } from '../../domain/entities/influencer.entity';
import { Product } from '../../domain/entities/product.entity';

// Custom Repositories
import { UserRepository } from './user.repository';
import { ContentRepository } from './content.repository';
import { InfluencerRepository } from './influencer.repository';
import { GeneratedImageRepository } from './generated-image.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      Content,
      Creator,
      GeneratedAudioEntity,
      GeneratedImageEntity,
      GeneratedMusicEntity,
      GeneratedVideoEntity,
      InfluencerEntity,
      Product,
    ]),
  ],
  providers: [
    UserRepository,
    ContentRepository,
    InfluencerRepository,
    GeneratedImageRepository,
  ],
  exports: [
    UserRepository,
    ContentRepository,
    InfluencerRepository,
    GeneratedImageRepository,
  ],
})
export class DatabaseModule {}