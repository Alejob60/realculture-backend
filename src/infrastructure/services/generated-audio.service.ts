import { Injectable } from '@nestjs/common';
import { LessThan } from 'typeorm';
import { GeneratedAudioRepository } from '../database/generated-audio.repository';
import { UserRepository } from '../database/user.repository';

@Injectable()
export class GeneratedAudioService {
  constructor(
    private readonly generatedAudioRepository: GeneratedAudioRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async saveAudio(
    userId: string,
    audioUrl: string,
    prompt: string,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const audio = this.generatedAudioRepository.create({
      user,
      audioUrl,
      prompt,
      createdAt: new Date(),
    });

    await this.generatedAudioRepository.save(audio);
    return {
      success: true,
      message: '✅ Audio guardado en la galería',
    };
  }

  async getAudiosByUserId(userId: string, page: number = 1, limit: number = 10) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const { data: audios, total } =
      await this.generatedAudioRepository.findAndCountByUserId(
        userId,
        page,
        limit,
      );

    return {
      data: audios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteExpiredAudios() {
    const now = new Date();
    const expiredAudios = await this.generatedAudioRepository.find({
      where: { createdAt: LessThan(now) },
    });

    if (expiredAudios.length > 0) {
      await this.generatedAudioRepository.remove(expiredAudios);
    }
  }
}