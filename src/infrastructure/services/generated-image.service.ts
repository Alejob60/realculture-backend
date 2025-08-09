import { Injectable } from '@nestjs/common';
import { LessThan, MoreThan } from 'typeorm';
import { AzureBlobService } from '../services/azure-blob.services';
import { GeneratedImageRepository } from '../database/generated-image.repository';
import { UserRepository } from '../database/user.repository';

@Injectable()
export class GeneratedImageService {
  constructor(
    private readonly generatedImageRepository: GeneratedImageRepository,
    private readonly userRepository: UserRepository,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  async saveImage(
    userId: string,
    prompt: string,
    imageUrl: string,
    filename: string,
    plan: string,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const expiresAt = new Date();
    if (plan === 'FREE') {
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 días
    }

    const image = this.generatedImageRepository.create({
      user,
      prompt,
      imageUrl,
      filename,
      createdAt: new Date(),
      expiresAt,
    });

    await this.generatedImageRepository.save(image);
    return {
      success: true,
      message: '✅ Imagen guardada en la galería',
      expiresAt,
    };
  }

  async getImagesByUserId(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const now = new Date();

    const images = await this.generatedImageRepository.find({
      where: {
        user: { userId: user.userId },
        expiresAt: MoreThan(now),
      },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

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
    const expiredImages = await this.generatedImageRepository.find({
      where: { expiresAt: LessThan(now) },
    });

    if (expiredImages.length > 0) {
      await this.generatedImageRepository.remove(expiredImages);
    }
  }
}