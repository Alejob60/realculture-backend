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

  constructor(private readonly httpService: HttpService) {
    this.logger.log(`MediaBridgeService initialized with generatorUrl: ${this.generatorUrl}`);
    this.logger.log(`MediaBridgeService initialized with VIDEO_SERVICE_URL: ${this.VIDEO_SERVICE_URL}`);
  }

  private buildHeaders(token?: string) {
    this.logger.log(`Building headers, token provided: ${!!token}`);
    if (token) {
      this.logger.log(`Token length: ${token.length}`);
      this.logger.log(`Token starts with Bearer: ${token.startsWith('Bearer ')}`);
    }
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    this.logger.log(`Building headers with token: ${!!token}, headers: ${JSON.stringify(headers)}`);
    return { headers };
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
      const config = {
        headers: { 'Content-Type': 'application/json' } as any,
      };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      this.logger.log(`Sending voice generation request with token: ${!!token}`);
      
      const response = await axios.post(
        `${this.generatorUrl}/voice/generate`,
        data,
        config,
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
    
    // Extract token from authorization header
    const authHeader = req.headers.authorization || '';
    let headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Log the request details for debugging
    this.logger.log(`Forwarding request to ${url}`);
    this.logger.log(`Authorization header present: ${!!authHeader}`);
    this.logger.log(`Authorization header value: ${authHeader}`);
    this.logger.log(`All request headers: ${JSON.stringify(req.headers)}`);
    this.logger.log(`Payload: ${JSON.stringify(payload)}`);

    // Validate payload
    if (!payload || typeof payload !== 'object') {
      this.logger.error(`Invalid payload: ${JSON.stringify(payload)}`);
      throw new Error('Invalid payload format.');
    }

    // Additional validation for audio generation requests
    if (endpoint === 'audio/generate') {
      if (!payload.prompt || typeof payload.prompt !== 'string' || payload.prompt.length === 0) {
        this.logger.error(`Invalid prompt in audio generation request: ${JSON.stringify(payload)}`);
        throw new Error('Invalid prompt in audio generation request.');
      }
      
      if (payload.duration && typeof payload.duration !== 'string') {
        this.logger.error(`Invalid duration format in audio generation request: ${JSON.stringify(payload)}`);
        throw new Error('Duration must be a string (e.g., "20s", "30s", "60s").');
      }
      
      if (payload.style && typeof payload.style !== 'string') {
        this.logger.error(`Invalid style format in audio generation request: ${JSON.stringify(payload)}`);
        throw new Error('Style must be a string.');
      }
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers }),
      );

      const data = response.data;

      if (!data || (!data.script && !data.result)) {
        this.logger.error(`❌ Unexpected response: ${JSON.stringify(data)}`);
        throw new Error('Unexpected response from service.');
      }

      return data.result ?? data;
    } catch (error) {
      this.logger.error(`❌ Error forwarding to ${url}`, error);
      
      // Log more details about the error
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        
        // If it's a 400 error, provide a more specific error message
        if (error.response.status === 400) {
          const errorMessage = error.response.data?.message || JSON.stringify(error.response.data);
          throw new Error(
            `Bad request to microservice: ${errorMessage}`,
          );
        }
        
        // If it's a 401 error, provide a specific error message
        if (error.response.status === 401) {
          throw new Error(
            'Unauthorized access to microservice. Please check authentication.',
          );
        }
      }
      
      throw new Error(
        'Error forwarding request to microservice: ' + (error.message || 'Unknown error'),
      );
    }
  }

  async generateAudio(data: any, token?: string) {
    try {
      this.logger.log(`Generating audio with data: ${JSON.stringify(data)}`);
      this.logger.log(`Token provided: ${!!token}`);
      if (token) {
        this.logger.log(`Token length: ${token.length}`);
      }
      this.logger.log(`Using generatorUrl: ${this.generatorUrl}`);
      
      const config = this.buildHeaders(token);
      this.logger.log(`Config headers: ${JSON.stringify(config.headers)}`);
      
      const url = `${this.generatorUrl}/audio/generate`;
      this.logger.log(`Full URL for audio generation: ${url}`);
      
      // Log the exact payload being sent
      this.logger.log(`Sending payload to audio service: ${JSON.stringify(data)}`);
      
      const response = await axios.post(
        url,
        data,
        config,
      );

      this.logger.log(`Received response from audio service: ${JSON.stringify(response.data)}`);

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

      const finalResult = {
        script: result.script,
        audioUrl,
        duration: result.duration ?? data.duration ?? 20,
        filename: result.filename ?? null,
        generationId: result.generationId ?? null,
      };
      
      this.logger.log(`Final audio result: ${JSON.stringify(finalResult)}`);
      
      return finalResult;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `❌ Error al generar audio (bridge): ${error.response?.status} - ${JSON.stringify(error.response?.data)}`,
        );
        this.logger.error(
          `❌ Error details - message: ${error.message}, code: ${error.code}, status: ${error.response?.status}`,
        );
        
        // Log the request details
        if (error.config) {
          this.logger.error(`❌ Request URL: ${error.config.url}`);
          this.logger.error(`❌ Request method: ${error.config.method}`);
          this.logger.error(`❌ Request headers: ${JSON.stringify(error.config.headers)}`);
          this.logger.error(`❌ Request data: ${JSON.stringify(error.config.data)}`);
        }
        
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