import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth.module';
import { ContentModule } from './infrastructure/modules/content.module';
import { HealthController } from './interfaces/controllers/health.controller';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UserModule } from './infrastructure/modules/user.module';
import { AiModule } from './infrastructure/modules/ai.module';
import { InfluencerModule } from './infrastructure/modules/influencer.module';
import { MediaModule } from './infrastructure/modules/media.module';
import { AudioModule } from './infrastructure/modules/audio.module';

// Import all entities
import { UserEntity } from './domain/entities/user.entity';
import { Content } from './domain/entities/content.entity';
import { InfluencerEntity } from './domain/entities/influencer.entity';
import { GeneratedVideoEntity } from './domain/entities/generated-video.entity';
import { GeneratedMusicEntity } from './domain/entities/generated-music.entity';
import { GeneratedImageEntity } from './domain/entities/generated-image.entity';
import { GeneratedAudioEntity } from './domain/entities/generated-audio.entity';
import { Product } from './domain/entities/product.entity';
import { Creator } from './domain/entities/creator.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
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
        synchronize: false,
        logging: true,
        migrations: ['dist/migrations/*.js'],
        // --- AÑADIR ESTA SECCIÓN PARA HABILITAR SSL ---
        ssl: {
          rejectUnauthorized: false,
        },
        // -------------------------------------------
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    HttpModule,
    ContentModule,
    DatabaseModule,
    UserModule,
    AiModule,
    InfluencerModule,
    MediaModule,
    AudioModule,
  ],
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class AppModule {}
