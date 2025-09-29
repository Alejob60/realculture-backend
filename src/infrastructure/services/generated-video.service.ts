import { Injectable } from '@nestjs/common';
import { GeneratedVideoRepository } from '../database/generated-video.repository';
import { UserRepository } from '../database/user.repository';

@Injectable()
export class GeneratedVideoService {
  constructor(
    private readonly generatedVideoRepository: GeneratedVideoRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async saveVideo(
    userId: string,
    jobId: string,
    prompt: object,
    script: string,
    fileName: string,
    videoUrl: string,
    audioUrl: string,
    subtitlesUrl: string,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    // Check if video with this jobId already exists
    const existingVideo = await this.generatedVideoRepository.findOne({
      where: { jobId },
    });

    if (existingVideo) {
      // Update existing video
      existingVideo.status = 'COMPLETED';
      existingVideo.script = script;
      existingVideo.fileName = fileName;
      existingVideo.videoUrl = videoUrl;
      existingVideo.audioUrl = audioUrl || null;
      existingVideo.subtitlesUrl = subtitlesUrl || null;
      existingVideo.completedAt = new Date();
      existingVideo.updatedAt = new Date();
      
      await this.generatedVideoRepository.save(existingVideo);
      return {
        success: true,
        message: '✅ Video actualizado en la galería',
        video: existingVideo,
      };
    }

    // Create new video entry
    const video = this.generatedVideoRepository.create({
      jobId,
      user,
      status: 'COMPLETED',
      prompt,
      script,
      fileName,
      videoUrl,
      audioUrl: audioUrl || null,
      subtitlesUrl: subtitlesUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
    });

    await this.generatedVideoRepository.save(video);
    return {
      success: true,
      message: '✅ Video guardado en la galería',
      video,
    };
  }

  async getVideosByUserId(userId: string, page: number = 1, limit: number = 10) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const { data: videos, total } =
      await this.generatedVideoRepository.findAndCountByUserId(
        userId,
        page,
        limit,
      );

    return {
      data: videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateVideoStatus(jobId: string, status: string, errorMessage?: string) {
    const video = await this.generatedVideoRepository.findOne({
      where: { jobId },
    });

    if (video) {
      video.status = status as any;
      video.errorMessage = errorMessage || null;
      video.updatedAt = new Date();
      
      if (status === 'COMPLETED') {
        video.completedAt = new Date();
      }
      
      await this.generatedVideoRepository.save(video);
    }
    
    return video;
  }
}