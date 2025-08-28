import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.services';
import { MediaBridgeService } from '../../infrastructure/services/media-bridge.service';
import { v4 as uuid } from 'uuid';

const VIDEO_CREDITS = 25;

@Controller('video')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);

  constructor(
    private readonly userService: UserService,
    private readonly azureBlobService: AzureBlobService,
    private readonly mediaBridgeService: MediaBridgeService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generateVideo(@Body() body: any, @Req() req: Request) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = (req as any).user?.userId;

      if (!token || !userId) {
        throw new HttpException(
          'Token inválido o usuario no identificado',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userService.findById(userId);
      if (!user) throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);

      if (user.credits < VIDEO_CREDITS) {
        throw new HttpException('Créditos insuficientes', HttpStatus.FORBIDDEN);
      }

      if (!body?.prompt || typeof body.prompt !== 'string') {
        throw new HttpException('Prompt inválido o vacío', HttpStatus.BAD_REQUEST);
      }

      // ✅ Llamada al microservicio video-generator
      const videoJob = await this.mediaBridgeService.generateVideo(body, token);

      this.logger.log('📥 Respuesta cruda del video-converter:', JSON.stringify(videoJob, null, 2));

      if (!videoJob?.result) {
        throw new HttpException('Error al generar el video', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const { videoFile, audioFile, script, prompt } = videoJob.result;
      if (!videoFile || !script) {
        throw new HttpException('Respuesta incompleta del microservicio', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // ✅ Crear archivo SRT con el script
      const srtContent = this.generateSRT(script, body.n_seconds || 20);
      const subtitlesFile = `subtitles/${uuid()}.srt`;
      await this.azureBlobService.uploadText(subtitlesFile, srtContent);

      // ✅ Resolver URLs
      const videoUrl = await this.resolveFileUrl(videoFile);
      const audioUrl = await this.resolveFileUrl(audioFile);
      const subtitlesUrl = await this.resolveFileUrl(subtitlesFile);

      // ✅ Descontar créditos
      const updatedUser = await this.userService.decrementCredits(userId, VIDEO_CREDITS);

      const finalResponse = {
        success: true,
        result: {
          videoUrl,
          audioUrl,
          subtitlesUrl,
          script,
          prompt,
        },
        credits: updatedUser.credits,
      };

      this.logger.log('📤 Respuesta final del backend:', JSON.stringify(finalResponse, null, 2));

      return finalResponse;
    } catch (error) {
      this.logger.error('❌ Error en generateVideo:', error.message);
      throw error;
    }
  }

  // 🔧 Detecta si es URL SAS o blobName
  private async resolveFileUrl(filePathOrUrl?: string): Promise<string | null> {
    if (!filePathOrUrl) return null;

    if (filePathOrUrl.startsWith('http')) {
      // Ya es URL con SAS → la devuelvo directa
      return filePathOrUrl;
    }

    // Si es blobName → esperar y generar SAS
    return this.waitAndGetSignedUrl(filePathOrUrl);
  }

  private async waitAndGetSignedUrl(blobName: string): Promise<string> {
    const maxRetries = 10;
    const delay = 3000; // 3 segundos
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const exists = await this.azureBlobService.checkIfBlobExists(blobName);
      if (exists) {
        return this.azureBlobService.getSignedUrl(blobName, 86400);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
    throw new HttpException(
      `El archivo ${blobName} no está disponible en blob storage.`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private generateSRT(script: string, duration: number): string {
    const lines = script.split(/[\.\?\!]\s+/);
    const segmentDuration = Math.floor(duration / lines.length);
    let currentTime = 0;
    let srt = '';

    lines.forEach((line, index) => {
      const start = this.formatTime(currentTime);
      const end = this.formatTime(currentTime + segmentDuration);
      srt += `${index + 1}\n${start} --> ${end}\n${line}\n\n`;
      currentTime += segmentDuration;
    });

    return srt.trim();
  }

  private formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${this.pad(hrs)}:${this.pad(mins)}:${this.pad(secs)},000`;
  }

  private pad(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
