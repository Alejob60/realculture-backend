import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpModule } from '@nestjs/axios';

// Entidades
import { UserEntity } from './domain/entities/user.entity';
import { Content } from './domain/entities/content.entity';
import { InfluencerEntity } from './domain/entities/influencer.entity';
import { Product } from './domain/entities/product.entity';
import { GeneratedImageEntity } from './domain/entities/generated-image.entity';
import { GeneratedAudioEntity } from './domain/entities/generated-audio.entity';
import { GeneratedMusicEntity } from './domain/entities/generated-music.entity';
import { GeneratedVideoEntity } from './domain/entities/generated-video.entity';

// Módulos
import { AuthModule } from './auth.module';
import { ContentModule } from './infrastructure/modules/content.module';

// Controladores
import { RagController } from './interfaces/controllers/rag.controller';
import { ContentController } from './interfaces/controllers/content.controller';
import { AiController } from './interfaces/controllers/ai.controller';
import { InfluencerController } from './interfaces/controllers/influencer.controller';
import { UserController } from './interfaces/controllers/user.controller';
import { MediaController } from './interfaces/controllers/media.controller';
import { PromoImageController } from './interfaces/controllers/promo-image.controller';
import { GalleryController } from './interfaces/controllers/gallery.controller';
import { AudioController } from './interfaces/controllers/audio.controller';

// Casos de uso
import { GenerateRagResponseUseCase } from './application/use-cases/generate-rag-response.use-case';
import { UseServiceUseCase } from './application/use-cases/use-service.use-case';
import { ContentUseCase } from './application/use-cases/content.use-case';

// Servicios
import { RagService } from './infrastructure/services/rag.service';
import { ContentService } from './infrastructure/services/content.service';
import { AiService } from './infrastructure/services/ai.service';
import { UserService } from './infrastructure/services/user.service';
import { GeneratedImageService } from './infrastructure/services/generated-image.service';
import { GalleryService } from './infrastructure/services/gallery.service';
import { MediaBridgeService } from './infrastructure/services/media-bridge.service';
import { AzureBlobService } from './infrastructure/services/azure-blob.services';

// Repositorios
import { ContentRepository } from './infrastructure/database/content.repository';
import { InfluencerRepository } from './infrastructure/database/influencer.repository';
import { UserRepository } from './infrastructure/database/user.repository';

// Estrategias
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { HealthController } from './interfaces/controllers/health.controller';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5544', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'realculturedb',
      entities: [
        UserEntity,
        Content,
        InfluencerEntity,
        Product,
        GeneratedImageEntity,
        GeneratedAudioEntity,
        GeneratedMusicEntity,
        GeneratedVideoEntity,
      ],
      synchronize: true,
    }),

    TypeOrmModule.forFeature([
      UserEntity,
      Content,
      InfluencerEntity,
      Product,
      GeneratedImageEntity,
      GeneratedAudioEntity,
      GeneratedMusicEntity,
      GeneratedVideoEntity,
    ]),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret-dev',
      signOptions: { expiresIn: '1d' },
    }),

    AuthModule,
    HttpModule,
    ContentModule,
  ],

  controllers: [
    RagController,
    ContentController,
    AiController,
    InfluencerController,
    UserController,
    MediaController,
    PromoImageController,
    GalleryController,
    AudioController,
    HealthController, // ✅ Añadido el controlador de salud
  ],

  providers: [
    RagService,
    GenerateRagResponseUseCase,
    ContentService,
    JwtStrategy,
    AiService,
    UserService,
    MediaBridgeService,
    UseServiceUseCase,
    GeneratedImageService,
    GalleryService,
    ContentUseCase,
    AzureBlobService, // ✅ Registro correcto aquí
    {
      provide: ContentRepository,
      useFactory: (repo: Repository<Content>) => new ContentRepository(repo),
      inject: [getRepositoryToken(Content)],
    },
    {
      provide: InfluencerRepository,
      useFactory: (repo: Repository<InfluencerEntity>) =>
        new InfluencerRepository(repo),
      inject: [getRepositoryToken(InfluencerEntity)],
    },
    {
      provide: UserRepository,
      useFactory: (repo: Repository<UserEntity>) => new UserRepository(repo),
      inject: [getRepositoryToken(UserEntity)],
    },
  ],

  exports: [AzureBlobService], // ✅ Para que otros módulos lo puedan importar si lo necesitas
})
export class AppModule {}
