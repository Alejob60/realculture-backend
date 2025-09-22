import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { UseServiceUseCase } from '../../application/use-cases/use-service.use-case';
import { AzureBlobService } from './azure-blob.services';
import { generateSRT } from '../../utils/srt-generator';
import { GenerateVideoDto } from '../../interfaces/dto/video-generation.dto';
import axios from 'axios';
import { waitForBlobAvailable } from '../../utils/azure-blob-wait';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private readonly useServiceUseCase: UseServiceUseCase,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  async generateVideo(dto: GenerateVideoDto, userId: string): Promise<any> {
    this.logger.log(`[generateVideo] INICIO - user: ${userId}, prompt: ${JSON.stringify(dto)}`);

    try {
      await this.useServiceUseCase.execute(userId, 'video');

      const validPlans = ['free', 'creator', 'pro'];
      const plan =
        typeof dto.plan === 'string' && validPlans.includes(dto.plan)
          ? dto.plan
          : 'free';

      const payload = {
        prompt: dto.prompt,
        plan,
        useVoice: dto.useVoice,
        useSubtitles: dto.useSubtitles,
        useMusic: dto.useMusic,
        useSora: dto.useSora,
      };
      this.logger.log(
        `[generateVideo] Payload enviado al video-converter: ${JSON.stringify(payload)}`,
      );

      const videoGeneratorUrl: string = process.env.VIDEO_GENERATOR_URL ?? '';
      if (!videoGeneratorUrl) {
        this.logger.error('[generateVideo] VIDEO_GENERATOR_URL indefinida');
        throw new InternalServerErrorException(
          'VIDEO_GENERATOR_URL no está definida.',
        );
      }

      let response;
      try {
        this.logger.log(`[generateVideo] POST → ${videoGeneratorUrl}`);
        response = await axios.post(videoGeneratorUrl, payload, {
          timeout: 240000,
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true, // evita que axios lance error si status != 200
        });
      } catch (err) {
        this.logger.error('[generateVideo] ❌ Error conectando al video-generator', {
          message: err.message,
          stack: err.stack,
          code: err.code,
          config: err.config
            ? {
                url: err.config.url,
                method: err.config.method,
                data: err.config.data,
              }
            : null,
        });
        throw new InternalServerErrorException(
          `Error de conexión con el microservicio video-generator: ${err.message}`,
        );
      }

      this.logger.log(`[generateVideo] HTTP status: ${response.status}`);
      this.logger.log(`[generateVideo] Respuesta RAW: ${JSON.stringify(response.data)}`);

      if (response.status !== 200) {
        throw new InternalServerErrorException(
          `El microservicio devolvió status ${response.status}: ${JSON.stringify(
            response.data,
          )}`,
        );
      }

      if (!response.data.success || !response.data.result) {
        throw new InternalServerErrorException(
          `Respuesta inválida del microservicio de video: ${JSON.stringify(
            response.data,
          )}`,
        );
      }

      const result = response.data.result;

      this.logger.log(
        `[generateVideo] Campos de result: ${JSON.stringify(response.data.result)}`,
      );
      this.logger.log(`[generateVideo] videoUrl RAW: ${result.videoUrl}`);

      // --- Validación de video ---
      const videoUrl = result.videoUrl;
      const videoBlobName = result.fileName;
      this.logger.log(
        `[generateVideo] Esperando disponibilidad de video blob: ${videoBlobName}`,
      );
      const videoReady = await waitForBlobAvailable(
        this.azureBlobService,
        'videos',
        videoBlobName,
        20,
        1000,
        this.logger,
      );
      if (!videoReady) {
        this.logger.error(
          `[generateVideo] El archivo ${videoUrl} no está disponible en blob storage tras 20 intentos.`,
        );
        return {
          success: false,
          message: `El archivo de video aún no está disponible, por favor reintente en unos segundos.`,
          data: {},
        };
      }

      // --- Validación de audio ---
      let audioUrl: string | null = result.audioUrl || null;
      if (result.audioFile && !result.audioUrl) {
        const audioBlobName = result.audioFile;
        this.logger.log(
          `[generateVideo] Esperando disponibilidad del audio blob: ${audioBlobName}`,
        );
        const audioReady = await waitForBlobAvailable(
          this.azureBlobService,
          'audio',
          audioBlobName,
          20,
          1000,
          this.logger,
        );
        if (audioReady) {
          audioUrl = await this.azureBlobService.getSignedUrlForContainer(
            'audio',
            audioBlobName,
          );
        }
      }

      // --- Subtítulos ---
      const subtitleFileName = `${videoBlobName.replace('.mp4', '')}.srt`;
      const srtContent = generateSRT(result.script || '');
      await this.azureBlobService.uploadBufferToContainer(
        Buffer.from(srtContent),
        subtitleFileName,
        'subtitles',
        'text/plain',
      );

      this.logger.log(
        `[generateVideo] Esperando disponibilidad de subtitle blob: ${subtitleFileName}`,
      );
      await waitForBlobAvailable(
        this.azureBlobService,
        'subtitles',
        subtitleFileName,
        20,
        1000,
        this.logger,
      );

      const signedSubtitleUrl =
        await this.azureBlobService.getSignedUrlForContainer(
          'subtitles',
          subtitleFileName,
        );

      const jsonResponse = {
        success: true,
        message: 'Video generado con éxito',
        data: {
          videoUrl: result.videoUrl,
          audioUrl: audioUrl,
          subtitleUrl: signedSubtitleUrl,
          duration: result.duration,
          script: result.script,
          plan: result.plan,
          fileName: result.fileName,
        },
      };

      this.logger.log(
        `[generateVideo] Retorno final al frontend: ${JSON.stringify(jsonResponse)}`,
      );
      return jsonResponse;
    } catch (error) {
      this.logger.error('❌ Error en generateVideo', {
        message: error.message,
        stack: error.stack,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : null,
      });
      throw new InternalServerErrorException(
        error.message || 'Error en la generación de video',
      );
    }
  }
}
