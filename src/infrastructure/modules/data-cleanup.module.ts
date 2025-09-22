import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '../../domain/entities/content.entity';
import { DataCleanupService } from '../services/data-cleanup.service';
import { DataCleanupController } from '../../interfaces/controllers/data-cleanup.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content]),
  ],
  controllers: [DataCleanupController],
  providers: [DataCleanupService],
  exports: [DataCleanupService],
})
export class DataCleanupModule {}