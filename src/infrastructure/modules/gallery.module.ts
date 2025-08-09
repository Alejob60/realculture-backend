
import { Module } from '@nestjs/common';
import { GalleryController } from '../../interfaces/controllers/gallery.controller';
import { GalleryService } from '../services/gallery.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
