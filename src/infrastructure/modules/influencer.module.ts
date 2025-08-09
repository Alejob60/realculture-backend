
import { Module } from '@nestjs/common';
import { InfluencerController } from '../../interfaces/controllers/influencer.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InfluencerController],
  providers: [],
})
export class InfluencerModule {}
