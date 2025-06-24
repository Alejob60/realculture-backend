// src/interfaces/controllers/audio.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../../infrastructure/services/user.service';
import { MediaBridgeService } from '../../infrastructure/services/media-bridge.service';
import { ContentService } from '../../infrastructure/services/content.service';
import { AudioCompleteDto } from '../dto/audio-complete.dto';
import { ContentUseCase } from '../../application/use-cases/content.use-case';

const AUDIO_DURATION_CREDIT_COST: Record<number, number> = {
  20: 5,
  30: 10,
  60: 25,
};

@Controller('/api/audio')
export class AudioController {
  constructor(
    private readonly userService: UserService,
    private readonly mediaBridgeService: MediaBridgeService,
    private readonly contentService: ContentService,
    private readonly contentUseCase: ContentUseCase,
  ) {}

  @Post('/generate')
  @UseGuards(JwtAuthGuard)
  async generateAudio(@Body() dto: any, @Req() req: Request) {
    const userId = req['user']?.userId;

    if (!userId) {
      throw new HttpException(
        'Usuario no autenticado.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const duration = dto.duration || 20;

    if (![20, 30, 60].includes(duration)) {
      throw new HttpException(
        'Duración no permitida. Usa 20, 30 o 60 segundos.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.findById(userId);
    const cost = AUDIO_DURATION_CREDIT_COST[duration];

    if (!user || user.credits < cost) {
      throw new HttpException(
        'No tienes suficientes créditos para generar este audio.',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.userService.decrementCredits(userId, cost);

    const result = await this.mediaBridgeService.forward(
      'audio/generate',
      req,
      dto,
    );

    // Validaciones seguras
    const script = result?.script || '';
    const audioUrl = result?.audioUrl || '';

    if (!script || !audioUrl) {
      throw new HttpException(
        'Respuesta inválida del servicio de audio.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.contentService.create({
      title: script.slice(0, 60),
      description: script,
      mediaUrl: audioUrl,
      creator: user,
    });

    return {
      message: 'Audio generado con éxito',
      script,
      audioUrl,
      duration: result.duration || duration,
      creditsUsed: cost,
    };
  }
  @Post('/complete')
  async registerGeneratedAudio(@Body() dto: AudioCompleteDto) {
    await this.contentUseCase.registerGeneratedContent({
      userId: dto.userId,
      type: 'audio',
      prompt: dto.prompt,
      url: dto.audioUrl,
      duration: dto.duration,
      status: 'complete',
      createdAt: new Date(),
    });

    return { success: true, message: '🎧 Audio registrado exitosamente' };
  }
}
