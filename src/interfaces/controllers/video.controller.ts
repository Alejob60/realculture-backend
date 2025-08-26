import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VideoService } from '../../infrastructure/services/video.service';
import { GenerateVideoDto } from '../dto/video-generation.dto';

@Controller('video')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);

  constructor(private readonly videoService: VideoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('generate')
  async generateVideo(@Body() dto: GenerateVideoDto, @Req() req: any) {
    try {
      const userId = req.user?.id || 'admin';

      this.logger.log(
        `🎬 Generating video for user ${userId} with prompt: ${dto.prompt}`,
      );

      // Pasamos dto + userId al servicio
      const result = await this.videoService.generateVideo(dto, userId);

      return {
        message: '✅ Video generado con éxito',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error generating video: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Error al generar el video: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
