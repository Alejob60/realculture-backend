import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GeneratedImageService } from '../../infrastructure/services/generated-image.service';

@UseGuards(JwtAuthGuard)
@Controller('gallery')
export class GalleryController {
  constructor(private readonly generatedImageService: GeneratedImageService) {}

  @Post('save-image')
  async saveImage(
    @Req() req: Request,
    @Body() body: { prompt: string; imageUrl: string },
  ) {
    const userId = req.user?.['userId'];
    if (!userId) {
      throw new BadRequestException('No se pudo obtener el userId del token');
    }

    const filename = `image_${Date.now()}.jpg`; // 🛡️ genera nombre único

    return this.generatedImageService.saveImage(
      userId,
      body.prompt,
      body.imageUrl,
      filename,
      'FREE',
    );
  }

  @Get('my-images')
  async getUserImages(@Req() req: Request) {
    const userId = req.user?.['userId'];
    if (!userId) {
      throw new BadRequestException('No se pudo obtener el userId del token');
    }

    return this.generatedImageService.getImagesByUserId(userId);
  }
}
