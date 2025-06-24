import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { GeneratedImageEntity } from '../../domain/entities/generated-image.entity';
import { UserEntity } from '../../domain/entities/user.entity';
import { AzureBlobService } from '../services/azure-blob.services';

@Injectable()
export class GeneratedImageService {
  constructor(
    @InjectRepository(GeneratedImageEntity)
    private readonly repo: Repository<GeneratedImageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  async saveImage(
    userId: string,
    prompt: string,
    imageUrl: string,
    filename: string,
    plan: string,
  ) {
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) throw new Error('Usuario no encontrado');

    const expiresAt = new Date();
    if (plan === 'FREE') {
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 días
    }

    const image = this.repo.create({
      user,
      prompt,
      imageUrl,
      filename,
      createdAt: new Date(),
      expiresAt,
    });

    await this.repo.save(image);
    return {
      success: true,
      message: '✅ Imagen guardada en la galería',
      expiresAt,
    };
  }

  async getImagesByUserId(userId: string) {
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) throw new Error('Usuario no encontrado');

    const now = new Date();

    const images = await this.repo.find({
      where: {
        user,
        expiresAt: MoreThan(now),
      },
      order: { createdAt: 'DESC' },
    });

    // 🔐 Generar SAS URL por imagen
    const result = await Promise.all(
      images.map(async (img) => {
        const signedUrl = await this.azureBlobService.getSignedUrl(
          img.filename,
          24 * 60 * 60,
        ); // 24h

        return {
          id: img.id,
          prompt: img.prompt,
          createdAt: img.createdAt,
          expiresAt: img.expiresAt,
          url: signedUrl,
        };
      }),
    );

    return result;
  }

  async deleteExpiredImages() {
    const now = new Date();
    const expiredImages = await this.repo.find({
      where: { expiresAt: LessThan(now) },
    });

    if (expiredImages.length > 0) {
      await this.repo.remove(expiredImages);
    }
  }
}
