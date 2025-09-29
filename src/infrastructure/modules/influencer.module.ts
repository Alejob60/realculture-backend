// src/infrastructure/modules/influencer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfluencerController } from '../../interfaces/controllers/influencer.controller';
import { DatabaseModule } from '../database/database.module';
import { InfluencerEntity } from '../../domain/entities/influencer.entity';
import { InfluencerService } from '../services/influencer.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([InfluencerEntity]),
  ],
  controllers: [InfluencerController],
  providers: [InfluencerService],
  exports: [InfluencerService],
})
export class InfluencerModule {}
