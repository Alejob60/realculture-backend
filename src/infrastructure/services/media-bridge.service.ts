import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class MediaBridgeService {
  private readonly logger = new Logger(MediaBridgeService.name);
  private readonly generatorUrl =
    process.env.VIDEO_GEN_URL || 'http://localhost:4000';
  private readonly VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL!;

  constructor(private readonly httpService: HttpService) {}

  private buildHeaders(token?: string) {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  async generatePromoImage(
    data: { prompt: string; plan: string; textOverlay?: string },
    token?: string,
  ): Promise<any> {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' } as any,
      };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.post(
        `${this.generatorUrl}/media/image`,
        data,
        config,
      );
      return response.data;
    } catch (error: unknown) {
      // --- MANEJO DE ERRORES MEJORADO ---
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = JSON.stringify(error.response?.data);
        this.logger.error(`❌ Error al generar imagen (bridge): Status ${status} - Data: ${errorData}`);
        throw new HttpException(error.response?.data, status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
      this.logger.error(`❌ Error al generar imagen (bridge): Error no relacionado con Axios.`, error);
      throw new InternalServerErrorException('Error inesperado en el servicio de media.');
    }
  }

  async generateVideo(data: any, token?: string) {
    try {
      const response = await axios.post(
        `${this.generatorUrl}/videos/generate`,
        data,
        this.buildHeaders(token),
      );
      return response.data;
    } catch (error) {
      this.logger.error('❌ Error al generar video:', error.message);
      throw error;
    }
  }

  async generateVoice(data: any, token?: string) {
    try {
      const response = await axios.post(
        `${this.generatorUrl}/voice/generate`,
        data,
        this.buildHeaders(token),
      );
      return response.data;
    } catch (error) {
      this.logger.error('❌ Error al generar voz:', error.message);
      throw error;
    }
  }

  async generateMusic(data: any, token?: string) {
    try {
      const response = await axios.post(
        `${this.generatorUrl}/music/generate`,
        data,
        this.buildHeaders(token),
      );
      return response.data;
    } catch (error) {
      this.logger.error('❌ Error al generar música:', error.message);
      throw error;
    }
  }

  async generateAgent(data: any, token?: string) {
    try {
      const response = await axios.post(
        `${this.generatorUrl}/agent/generate`,
        data,
        this.buildHeaders(token),
      );
      return response.data;
    } catch (error) {
      this.logger.error('❌ Error al generar agente IA:', error.message);
      throw error;
    }
  }

  async generateSubtitles(data: any, token?: string) {
    try {
      const response = await axios.post(
        `${this.generatorUrl}/subtitles/generate`,
        data,
        this.buildHeaders(token),
      );
      return response.data;
    } catch (error) {
      this.logger.error('❌ Error al generar subtítulos:', error.message);
      throw error;
    }
  }

  async generateAvatar(data: any, token?: string) {
    try {
      const response = await axios.post(
        `${this.generatorUrl}/avatar/generate`,
        data,
        this.buildHeaders(token),
      );
      return response.data;
    } catch (error) {
      this.logger.error('❌ Error al generar avatar IA:', error.message);
      throw error;
    }
  }

  async generateCampaign(data: any, token?: string) {
    try {
      const response = await axios.post(
        `${this.generatorUrl}/campaign/generate`,
        data,
        this.buildHeaders(token),
      );
      return response.data;
    } catch (error) {
      this.logger.error('❌ Error al automatizar campaña IA:', error.message);
      throw error;
    }
  }

  async fetchAudioFile(filename: string): Promise<Buffer> {
    try {
      const url = `${this.generatorUrl}/audio/${filename}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      this.logger.error(
        `❌ Error al obtener archivo de audio ${filename}:`,
        error.message,
      );
      throw error;
    }
  }

  async forward(endpoint: string, req: Request, payload: any): Promise<any> {
    const url = `${this.VIDEO_SERVICE_URL}/${endpoint}`;
    const headers = {
      Authorization: req.headers.authorization || '',
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers }),
      );

      const data = response.data;

      if (!data || (!data.script && !data.result)) {
        this.logger.error(`❌ Respuesta inesperada: ${JSON.stringify(data)}`);
        throw new Error('Respuesta inesperada del servicio.');
      }

      return data.result ?? data;
    } catch (error) {
      this.logger.error(`❌ Error reenviando a ${url}`, error);
      throw new Error(
        'Error al reenviar la solicitud al microservicio de video.',
      );
    }
  }
}