import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneratedImageEntity } from '../../domain/entities/generated-image.entity';
import { GeneratedVideoEntity } from '../../domain/entities/generated-video.entity';
import { GeneratedAudioEntity } from '../../domain/entities/generated-audio.entity';
import { GeneratedMusicEntity } from '../../domain/entities/generated-music.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GeneratedImageEntity)
    private readonly imageRepo: Repository<GeneratedImageEntity>,

    @InjectRepository(GeneratedVideoEntity)
    private readonly videoRepo: Repository<GeneratedVideoEntity>,

    @InjectRepository(GeneratedAudioEntity)
    private readonly audioRepo: Repository<GeneratedAudioEntity>,

    @InjectRepository(GeneratedMusicEntity)
    private readonly musicRepo: Repository<GeneratedMusicEntity>,
  ) {}

  async getUserGallery(userId: string) {
    const [images, videos, audios, music] = await Promise.all([
      this.imageRepo.find({
        where: { user: { userId } },
        order: { createdAt: 'DESC' },
      }),
      this.videoRepo.find({
        where: { user: { userId } },
        order: { createdAt: 'DESC' },
      }),
      this.audioRepo.find({
        where: { user: { userId } },
        order: { createdAt: 'DESC' },
      }),
      this.musicRepo.find({
        where: { user: { userId } },
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      images,
      videos,
      audios,
      music,
    };
  }
}
