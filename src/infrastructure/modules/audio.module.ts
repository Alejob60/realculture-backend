
import { Module } from '@nestjs/common';
import { AudioController } from '../../interfaces/controllers/audio.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AudioController],
  providers: [],
})
export class AudioModule {}
