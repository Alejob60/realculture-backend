
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from './domain/entities/user.entity';
import { Content } from './domain/entities/content.entity';
import { InfluencerEntity } from './domain/entities/influencer.entity';
import { GeneratedVideoEntity } from './domain/entities/generated-video.entity';
import { GeneratedMusicEntity } from './domain/entities/generated-music.entity';
import { GeneratedImageEntity } from './domain/entities/generated-image.entity';
import { GeneratedAudioEntity } from './domain/entities/generated-audio.entity';
import { Product } from './domain/entities/product.entity';
import { Creator } from './domain/entities/creator.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5544'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
  entities: [
    UserEntity,
    Content,
    InfluencerEntity,
    GeneratedVideoEntity,
    GeneratedMusicEntity,
    GeneratedImageEntity,
    GeneratedAudioEntity,
    Product,
    Creator,
  ],
  migrations: ['dist/migrations/*.js'],
  synchronize: false, // Never set to true in production
  logging: true,
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
