// src/api/controllers/video.controller.ts

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
import { VideoService } from '../../infrastructure/services/video.service';

@Controller('api/v1/video')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);

  constructor(private readonly videoService: VideoService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generateVideo(@Body() body: any, @Req() req: Request) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        this.logger.warn('Usuario no autenticado o token inválido');
        throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);
      }

      const {
        prompt,
        n_seconds,
        useVoice = true,
        useSubtitles = true,
        useMusic = true,
        useSora = true,
      } = body;

      // Validaciones básicas
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        throw new HttpException('Prompt inválido o vacío', HttpStatus.BAD_REQUEST);
      }

      if (!n_seconds || typeof n_seconds !== 'number' || n_seconds <= 0) {
        throw new HttpException('Duración inválida', HttpStatus.BAD_REQUEST);
      }

      // Ejecutar generación de video (logica dentro del servicio)
      const videoResult = await this.videoService.generateFullVideo({
        userId,
        prompt,
        n_seconds,
        useVoice,
        useSubtitles,
        useMusic,
        useSora,
      });

      return {
        success: true,
        data: videoResult,
      };
    } catch (error: any) {
      this.logger.error('Error en generateVideo:', error?.message || error);
      throw new HttpException(
        error.message || 'Error interno al generar video',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
