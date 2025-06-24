import {
  Controller,
  Post,
  Req,
  Body,
  Param,
  Get,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
  Query,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UseServiceUseCase } from '../../application/use-cases/use-service.use-case';
import { UserService } from '../../infrastructure/services/user.service';
import { GeneratedImageService } from '../../infrastructure/services/generated-image.service';
import { HttpService } from '@nestjs/axios';
import { MediaBridgeService } from '../../infrastructure/services/media-bridge.service';
import { Public } from 'src/common/decorators/public.decorator';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.services';

@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(
    private readonly useService: UseServiceUseCase,
    private readonly mediaBridgeService: MediaBridgeService,
    private readonly userService: UserService,
    private readonly imageService: GeneratedImageService,
    private readonly httpService: HttpService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  private extractUserData(req: Request): { userId: string; token: string } {
    const userId = req.user?.['userId'];
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!userId || !token) {
      throw new UnauthorizedException(
        'Usuario no autenticado o token no encontrado',
      );
    }
    return { userId, token };
  }

  @Post(':type')
  async generate(
    @Param('type') type: string,
    @Req() req: Request,
    @Body() body: any,
  ) {
    const { userId, token } = this.extractUserData(req);

    const typeMap: Record<
      string,
      'image' | 'video' | 'tts' | 'voice' | 'music' | 'ai-agent'
    > = {
      image: 'image',
      video: 'video',
      voice: 'voice',
      music: 'music',
      agent: 'ai-agent',
    };

    const usageKey = typeMap[type];
    if (!usageKey) {
      throw new BadRequestException(`Tipo de contenido no soportado: ${type}`);
    }

    await this.useService.execute(userId, usageKey);

    const serviceMap: Record<
      string,
      (data: any, token?: string) => Promise<any>
    > = {
      image: this.mediaBridgeService.generatePromoImage,
      video: this.mediaBridgeService.generateVideo,
      voice: this.mediaBridgeService.generateVoice,
      music: this.mediaBridgeService.generateMusic,
      agent: this.mediaBridgeService.generateAgent,
    };

    const generate = serviceMap[type];
    let result;

    if (type === 'image') {
      const user = await this.userService.findById(userId);
      if (!user || !user.plan) {
        throw new UnauthorizedException(
          'No se pudo determinar el plan del usuario',
        );
      }

      const plan = user.plan;
      result = await this.mediaBridgeService.generatePromoImage({
        prompt: body.prompt,
        plan,
      });

      const prompt = result?.result?.prompt;
      const imageUrl = result?.result?.imageUrl;
      const filename = result?.result?.filename;

      if (imageUrl && prompt && filename) {
        await this.imageService.saveImage(
          userId,
          prompt,
          imageUrl,
          filename,
          plan,
        );
      }
    } else {
      result = await generate.call(this.mediaBridgeService, body, token);
    }

    const updatedUser = await this.userService.findById(userId);
    if (!updatedUser) {
      throw new UnauthorizedException(
        'Usuario no encontrado luego de generar contenido',
      );
    }

    return {
      success: true,
      message: `✅ ${type.toUpperCase()} generado correctamente`,
      result: { ...(result?.result || {}) }, // 🔁 Aquí se incluye filename
      credits: updatedUser.credits,
    };
  }

  @Get('images')
  async getImages(@Req() req: Request) {
    const userId = (req.user as any).sub;
    const images = await this.imageService.getImagesByUserId(userId);
    return { success: true, result: images };
  }

  @Get('proxy-image')
  @Public()
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    try {
      const imageResponse = await this.httpService.axiosRef.get(url, {
        responseType: 'arraybuffer',
      });

      res.setHeader('Content-Type', imageResponse.headers['content-type']);
      res.send(imageResponse.data);
    } catch (error) {
      this.logger.error(`Error al cargar imagen: ${error.message}`);
      throw new HttpException(
        'No se pudo cargar la imagen remota',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Get('preview/:filename')
  async serveAudio(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const buffer = await this.mediaBridgeService.fetchAudioFile(filename);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      throw new HttpException('Audio no encontrado', HttpStatus.NOT_FOUND);
    }
  }

  @Get('/signed-image/:filename')
  async getSignedImageUrl(@Param('filename') filename: string) {
    const signedUrl = await this.azureBlobService.getSignedUrl(filename, 86400); // 1 día
    return { url: signedUrl };
  }
  @Get('my-images')
  @UseGuards(JwtAuthGuard)
  async getMyImages(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    if (!userId) {
      throw new UnauthorizedException(
        'No se pudo obtener el usuario del token',
      );
    }

    const images = await this.imageService.getImagesByUserId(userId);
    return images;
  }
}
