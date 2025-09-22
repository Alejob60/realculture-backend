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
    data: { prompt: string; jsonPrompt?: any; plan: string; textOverlay?: string; useFlux?: boolean },
    token?: string,
  ): Promise<any> {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' } as any,
      };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Include jsonPrompt in the payload if provided
      const payload = {
        prompt: data.prompt,
        jsonPrompt: data.jsonPrompt,
        plan: data.plan,
        textOverlay: data.textOverlay,
        useFlux: data.useFlux, // Add useFlux flag to the payload
      };
      
      this.logger.log(`Sending request to image generation service: ${this.generatorUrl}/media/image with payload: ${JSON.stringify(payload)}`);
      
      const response = await axios.post(
        `${this.generatorUrl}/media/image`,
        payload,
        config,
      );
      
      this.logger.log(`Received response from image generation service: ${JSON.stringify(response.data)}`);
      
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = JSON.stringify(error.response?.data);
        const errorMessage = error.message;
        
        this.logger.error(
          `❌ Error al generar imagen (bridge): Status ${status} - Data: ${errorData} - Message: ${errorMessage}`,
        );
        
        // Log additional details for debugging without trying to stringify circular objects
        if (error.request) {
          // Instead of trying to stringify the entire request object, we just log that it exists
          this.logger.error(`❌ Request details: Request object exists but contains circular references`);
        }
        if (error.config) {
          this.logger.error(`❌ Config details: ${JSON.stringify(error.config)}`);
        }
        
        throw new HttpException(
          error.response?.data || { 
            message: 'Error generando imagen.', 
            details: errorMessage,
            status: status
          },
          status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.logger.error(
        `❌ Error al generar imagen (bridge): Error no relacionado con Axios.`,
        error,
      );
      throw new InternalServerErrorException(
        'Error inesperado en el servicio de media.',
      );
    }
  }

  async generateVideo(
    data: {
      prompt: string;
      jsonPrompt?: any;
      plan?: string;
      useVoice?: boolean;
      useSubtitles?: boolean;
      useMusic?: boolean;
      useSora?: boolean;
    },
    token?: string,
  ): Promise<any> {
    try {
      // Normalización del plan
      const validPlans = ['free', 'creator', 'pro'];
      const plan =
        data.plan && validPlans.includes(data.plan.toLowerCase())
          ? data.plan.toLowerCase()
          : 'free';

      // Use jsonPrompt if provided, otherwise use text prompt
      // The microservice might only accept one type of prompt
      const payload: any = {
        plan,
        useVoice: !!data.useVoice,
        useSubtitles: !!data.useSubtitles,
        useMusic: !!data.useMusic,
        useSora: !!data.useSora,
      };

      if (data.jsonPrompt) {
        // If jsonPrompt is provided, send it as the prompt (stringified)
        payload.prompt = typeof data.jsonPrompt === 'string' 
          ? data.jsonPrompt 
          : JSON.stringify(data.jsonPrompt);
      } else {
        // Otherwise, send the text prompt
        payload.prompt = data.prompt;
      }

      const config = {
        headers: { 'Content-Type': 'application/json' } as any,
      };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      this.logger.log(
        `[generateVideo] URL: ${this.generatorUrl}/videos/generate`,
      );
      this.logger.log(`[generateVideo] Payload: ${JSON.stringify(payload)}`);

      const response = await axios.post(
        `${this.generatorUrl}/videos/generate`,
        payload,
        { ...config, timeout: 600000 }, // Increased to 10 minutes (600000ms)
      );

      this.logger.log(
        `[generateVideo] RAW response: ${JSON.stringify(response.data)}`,
      );

      // Aceptar tanto { result: {...} } como {...} directo
      const result = response.data.result ?? response.data;

      if (!result || !result.videoUrl) {
        throw new HttpException(
          'Respuesta inválida del microservicio de video',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        result: {
          videoFile: result.videoUrl,
          audioFile: result.audioUrl ?? null,
          script: result.script ?? '',
          prompt: data.prompt,
        },
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data ? JSON.stringify(error.response.data) : 'No response data';
        
        // Handle timeout specifically
        if (error.code === 'ECONNABORTED') {
          this.logger.error(
            `❌ Error al generar video (bridge): Timeout - Request took longer than 240000ms`,
          );
          throw new HttpException(
            'El servicio de video tardó demasiado en responder. Por favor, inténtalo de nuevo más tarde.',
            HttpStatus.REQUEST_TIMEOUT,
          );
        }
        
        // Handle network errors
        if (!error.response) {
          this.logger.error(
            `❌ Error al generar video (bridge): Network error or connection refused - ${error.message}`,
          );
          throw new HttpException(
            'No se pudo conectar con el servicio de video. Por favor, inténtalo de nuevo más tarde.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        
        this.logger.error(
          `❌ Error al generar video (bridge): Status ${status} - Data: ${errorData}`,
        );
        throw new HttpException(
          error.response?.data || 'Error en el servicio de video',
          status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.error(
        '❌ Error al generar video (bridge): Error inesperado',
        error,
      );
      throw new InternalServerErrorException(
        'Error inesperado en el servicio de video: ' + (error.message || 'Error desconocido'),
      );
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
  async generateAudio(data: any, token?: string) {
    try {
      const response = await axios.post(
        `${this.generatorUrl}/audio/generate`,
        data,
        this.buildHeaders(token),
      );

      const result = response.data?.result ?? response.data;

      let audioUrl: string | null = result?.audioUrl ?? result?.blobUrl ?? null;

      if (!audioUrl && result?.filename) {
        audioUrl = `${this.generatorUrl}/audio/${result.filename}`;
      }

      if (!result || !result.script || !audioUrl) {
        this.logger.error(
          `❌ Respuesta inválida del servicio de audio: ${JSON.stringify(response.data)}`,
        );
        throw new HttpException(
          'Respuesta inválida del servicio de audio',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        script: result.script,
        audioUrl,
        duration: result.duration ?? data.duration ?? 20,
        filename: result.filename ?? null,
        generationId: result.generationId ?? null,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `❌ Error al generar audio (bridge): ${error.response?.status} - ${JSON.stringify(error.response?.data)}`,
        );
        throw new HttpException(
          error.response?.data,
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.logger.error('❌ Error inesperado al generar audio', error);
      throw new InternalServerErrorException('Error inesperado en el servicio de audio');
    }
  }

}