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
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { RequestWithUser } from '../../types/request-with-user';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UseServiceUseCase } from '../../application/use-cases/use-service.use-case';
import { UserService } from '../../infrastructure/services/user.service';
import { GeneratedImageService } from '../../infrastructure/services/generated-image.service';
import { GeneratedAudioService } from '../../infrastructure/services/generated-audio.service';
import { HttpService } from '@nestjs/axios';
import { MediaBridgeService } from '../../infrastructure/services/media-bridge.service';
import { Public } from '../../common/decorators/public.decorator';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.services';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('media')
@UseGuards(JwtAuthGuard)
@Controller('media')
@ApiBearerAuth()
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(
    private readonly useService: UseServiceUseCase,
    private readonly mediaBridgeService: MediaBridgeService,
    private readonly userService: UserService,
    private readonly imageService: GeneratedImageService,
    private readonly audioService: GeneratedAudioService,
    private readonly httpService: HttpService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  private extractUserData(req: RequestWithUser): { userId: string; token: string } {
    const userId = req.user?.id;
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    if (!userId || !token) {
      throw new UnauthorizedException(
        'Usuario no autenticado o token no encontrado',
      );
    }
    return { userId, token };
  }

  @Post(':type')
  @ApiOperation({ summary: 'Generate media content' })
  @ApiParam({
    name: 'type',
    enum: ['image', 'video', 'voice', 'music', 'agent', 'audio'],
    description: 'Type of media to generate',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', example: 'A beautiful landscape' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media generated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async generate(
    @Param('type') type: string,
    @Req() req: RequestWithUser,
    @Body() body: any,
  ) {
    // Log all request details for debugging
    this.logger.log(`Received request for media type: ${type}`);
    this.logger.log(`Request headers: ${JSON.stringify(req.headers)}`);
    this.logger.log(`Request body: ${JSON.stringify(body)}`);
    this.logger.log(`User object: ${JSON.stringify(req.user)}`);
    
    const { userId, token } = this.extractUserData(req);
    
    this.logger.log(`Extracted userId: ${userId}`);
    this.logger.log(`Extracted token: ${token ? 'PRESENT' : 'MISSING'}`);
    if (token) {
      this.logger.log(`Token length: ${token.length}`);
    }

    const typeMap: Record<
      string,
      'image' | 'video' | 'tts' | 'voice' | 'music' | 'ai-agent' | 'audio'
    > = {
      image: 'image',
      video: 'video',
      voice: 'voice',
      music: 'music',
      agent: 'ai-agent',
      audio: 'audio',
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
      audio: this.mediaBridgeService.generateAudio,
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
    } else if (type === 'audio') {
      // For audio service, pass the token properly
      this.logger.log(`Calling service for type: ${type} with token: ${token ? 'PRESENT' : 'MISSING'}`);
      this.logger.log(`Passing body to service: ${JSON.stringify(body)}`);
      result = await generate.call(this.mediaBridgeService, body, token);
      
      // Save audio to database
      const audioUrl = result?.audioUrl || result?.result?.audioUrl;
      const prompt = body.prompt;
      
      if (audioUrl && prompt) {
        await this.audioService.saveAudio(
          userId,
          audioUrl,
          prompt,
        );
      }
      
      // For audio service, the result is returned directly, not wrapped in a result property
      // So we need to wrap it for consistency with the response format
      if (result && !result.result) {
        result = { result: result };
      }
    } else {
      // For other services, pass the token properly
      this.logger.log(`Calling service for type: ${type} with token: ${token ? 'PRESENT' : 'MISSING'}`);
      this.logger.log(`Passing body to service: ${JSON.stringify(body)}`);
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
      result: { ...(result?.result || result || {}) }, // Handle both wrapped and unwrapped results
      credits: updatedUser.credits,
    };
  }

  @Get('images')
  @ApiOperation({ summary: 'Get generated images' })
  @ApiResponse({ status: 200, description: 'Returns generated images.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getImages(
    @Req() req: RequestWithUser,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    const userId = req.user.id;
    const images = await this.imageService.getImagesByUserId(
      userId,
      paginationDto,
    );
    return { success: true, result: images };
  }

  @Get('audios')
  @ApiOperation({ summary: 'Get generated audios' })
  @ApiResponse({ status: 200, description: 'Returns generated audios.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAudios(
    @Req() req: RequestWithUser,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    const userId = req.user.id;
    const audios = await this.audioService.getAudiosByUserId(
      userId,
      paginationDto.page,
      paginationDto.limit,
    );
    return { success: true, result: audios };
  }

  @Get('proxy-image')
  @Public()
  @ApiOperation({ summary: 'Proxy an image from a URL' })
  @ApiQuery({ name: 'url', type: 'string', description: 'URL of the image to proxy' })
  @ApiResponse({ status: 200, description: 'Image proxied successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
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
  @ApiOperation({ summary: 'Serve audio file preview' })
  @ApiParam({ name: 'filename', type: 'string', description: 'Name of the audio file' })
  @ApiResponse({ status: 200, description: 'Audio file served successfully.' })
  @ApiResponse({ status: 404, description: 'Audio file not found.' })
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
  @ApiOperation({ summary: 'Get signed URL for an image' })
  @ApiParam({ name: 'filename', type: 'string', description: 'Name of the image file' })
  @ApiResponse({ status: 200, description: 'Signed URL generated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSignedImageUrl(@Param('filename') filename: string) {
    const signedUrl = await this.azureBlobService.getSignedUrl(filename, 86400);
    return { url: signedUrl };
  }

  @Get('my-images')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my images' })
  @ApiResponse({ status: 200, description: 'Returns user images.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyImages(
    @Req() req: RequestWithUser,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new UnauthorizedException(
        'No se pudo obtener el usuario del token',
      );
    }

    const images = await this.imageService.getImagesByUserId(
      userId,
      paginationDto,
    );
    return images;
  }
}