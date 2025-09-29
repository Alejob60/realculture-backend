import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth.module';
import { ContentModule } from './infrastructure/modules/content.module';
import { HealthController } from './interfaces/controllers/health.controller';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UserModule } from './infrastructure/modules/user.module';
import { AiModule } from './infrastructure/modules/ai.module';
import { InfluencerModule } from './infrastructure/modules/influencer.module';
import { MediaModule } from './infrastructure/modules/media.module';
// import { AudioModule } from './infrastructure/modules/audio.module';  // Removed as audio is now handled by MediaController
import { VideoModule } from './infrastructure/modules/video.module';
import { PromptJsonService } from './infrastructure/services/prompt-json.service';
import { PromptJsonController } from './interfaces/controllers/prompt-json.controller';
import { GalleryModule } from './infrastructure/modules/gallery.module';
import { DataCleanupModule } from './infrastructure/modules/data-cleanup.module';
import { MediaProcessingModule } from './application/media/media.module'; // Add our new module
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
import { MergedMediaEntity } from './domain/entities/merged-media.entity'; // Add our new entity

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
          GeneratedAudioEntity,  // Re-enabled as we've fixed the entity
          Product,
          Creator,
          MergedMediaEntity, // Add our new entity
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
    MediaProcessingModule, // Add our new module
    // AudioModule,  // Removed as audio is now handled by MediaController
    VideoModule, // Añadir el módulo de Video
    GalleryModule,
    DataCleanupModule,
  ],
  controllers: [HealthController, PromptJsonController],
  providers: [PromptJsonService],
  exports: [],
})
export class AppModule {}