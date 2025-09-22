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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.services';
import { MediaBridgeService } from '../../infrastructure/services/media-bridge.service';
import { v4 as uuid } from 'uuid';
import { RequestWithUser } from 'src/types/request-with-user';
import { GenerateVideoDto } from '../dto/video-generation.dto';

const VIDEO_CREDITS = 25;

@ApiTags('video')
@Controller('video')
@UseGuards(JwtAuthGuard)
export class VideoController {
  private readonly logger = new Logger(VideoController.name);

  constructor(
    private readonly userService: UserService,
    private readonly azureBlobService: AzureBlobService,
    private readonly mediaBridgeService: MediaBridgeService,
  ) {}

  @Post('generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate video from prompt' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', example: 'Create a video about space exploration' },
        jsonPrompt: { 
          type: 'object', 
          example: { 
            scene: 'Space', 
            characters: ['Astronaut'],
            camera: 'Wide angle',
            lighting: 'Bright',
            style: 'Cinematic',
            interactionFocus: 'Exploring'
          }, 
          description: 'JSON prompt for video generation' 
        },
        plan: { type: 'string', example: 'free', description: 'User plan' },
        useVoice: { type: 'boolean', example: true, description: 'Include voice in video' },
        useSubtitles: { type: 'boolean', example: true, description: 'Include subtitles in video' },
        useMusic: { type: 'boolean', example: false, description: 'Include music in video' },
        useSora: { type: 'boolean', example: true, description: 'Use Sora for video generation' },
        n_seconds: { type: 'number', example: 30, description: 'Duration in seconds' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Video generated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async generateVideo(@Body() body: GenerateVideoDto, @Req() req: RequestWithUser) {
    try {
      // Extract userId from the properly typed user object
      const userId = req.user?.id;
      this.logger.log(`Extracted userId from request: ${userId}`);

      // Validate user object and userId
      if (!req.user) {
        this.logger.error('User object is undefined in request');
        throw new HttpException('Usuario no identificado', HttpStatus.UNAUTHORIZED);
      }
      
      if (!userId) {
        this.logger.error('User ID is undefined in request');
        throw new HttpException('ID de usuario no encontrado', HttpStatus.UNAUTHORIZED);
      }

      // Validate body
      if (!body || (!body.prompt && !body.jsonPrompt)) {
        throw new HttpException('Debe proporcionar un prompt o jsonPrompt', HttpStatus.BAD_REQUEST);
      }

      // If jsonPrompt is provided, use it; otherwise use the text prompt
      const effectivePrompt = body.jsonPrompt ? JSON.stringify(body.jsonPrompt) : body.prompt;
      if (typeof effectivePrompt !== 'string') {
        throw new HttpException('Prompt o jsonPrompt inválido', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userService.findById(userId);
      if (!user) throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);

      if (user.credits < VIDEO_CREDITS) {
        throw new HttpException('Créditos insuficientes', HttpStatus.FORBIDDEN);
      }

      // Update body with effective prompt for downstream processing
      const updatedBody = { ...body, prompt: effectivePrompt };
      const result = await this.handleVideoGeneration(updatedBody, userId);
      const updatedUser = await this.userService.decrementCredits(userId, VIDEO_CREDITS);

      const response = {
        success: true,
        result,
        credits: updatedUser.credits,
      };

      this.logger.log(
        `[VideoController] Video generado user=${userId}: ${JSON.stringify(response)}`
      );

      return response;
    } catch (error) {
      this.logger.error(`[VideoController] Error: ${error.message}`, error.stack);
      throw error instanceof HttpException
        ? error
        : new HttpException('Error interno de video', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async handleVideoGeneration(body: GenerateVideoDto, userId: string) {
    // We need to get the token from the headers, but we don't have access to the request here
    // For now, we'll pass an empty string and handle token retrieval in the service if needed
    const token = '';
    
    // Pass both prompt and jsonPrompt to the media bridge service
    const videoJob = await this.mediaBridgeService.generateVideo({
      prompt: body.prompt,
      jsonPrompt: body.jsonPrompt,
      plan: body.plan,
      useVoice: body.useVoice,
      useSubtitles: body.useSubtitles,
      useMusic: body.useMusic,
      useSora: body.useSora
    }, token);
    
    if (!videoJob?.result) {
      throw new HttpException('Error al generar el video', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { videoFile, audioFile, script, prompt } = videoJob.result;
    if (!videoFile || !script) {
      throw new HttpException('Respuesta incompleta del microservicio', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const srtContent = VideoController.generateSRT(script, body['n_seconds'] || 20);
    const subtitlesFile = `subtitles/${uuid()}.srt`;
    // Upload subtitles to the appropriate container
    const subtitlesContainer = process.env.AZURE_STORAGE_CONTAINER_VIDEO || process.env.AZURE_BLOB_CONTAINER || 'videos';
    await this.azureBlobService.uploadText(subtitlesFile, srtContent, subtitlesContainer);

    const [videoUrl, audioUrl, subtitlesUrl] = await Promise.all([
      this.resolveFileUrl(videoFile),
      this.resolveFileUrl(audioFile),
      this.resolveFileUrl(subtitlesFile, subtitlesContainer),
    ]);

    return { videoUrl, audioUrl, subtitlesUrl, script, prompt };
  }

  private async resolveFileUrl(filePathOrUrl?: string, containerName?: string): Promise<string | null> {
    if (!filePathOrUrl) return null;
    if (filePathOrUrl.startsWith('http')) return filePathOrUrl;
    return this.waitAndGetSignedUrl(filePathOrUrl, containerName);
  }

  private async waitAndGetSignedUrl(blobName: string, containerName?: string): Promise<string> {
    const maxRetries = 10;
    const delay = 3000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const exists = containerName 
        ? await this.azureBlobService.checkIfBlobExists(blobName, containerName)
        : await this.azureBlobService.checkIfBlobExists(blobName);
      if (exists) {
        return containerName
          ? this.azureBlobService.getSignedUrlForContainer(containerName, blobName, 86400)
          : this.azureBlobService.getSignedUrl(blobName, 86400);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
    throw new HttpException(
      `El archivo ${blobName} no está disponible en blob storage.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private static generateSRT(script: string, duration: number): string {
    const lines = script.split(/[\.\?\!]\s+/);
    const segmentDuration = Math.floor(duration / lines.length);
    let currentTime = 0;
    let srt: string = '';
    lines.forEach((line, index) => {
      const start = VideoController.formatTime(currentTime);
      const end = VideoController.formatTime(currentTime + segmentDuration);
      srt += `${index + 1}
${start} --> ${end}
${line}

`;
      currentTime += segmentDuration;
    });
    return srt.trim();
  }

  private static formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${VideoController.pad(hrs)}:${VideoController.pad(mins)}:${VideoController.pad(secs)},000`;
  }

  private static pad(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}