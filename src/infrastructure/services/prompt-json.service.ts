import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PromptJsonService {
  private readonly logger = new Logger(PromptJsonService.name);
  private readonly baseUrl: string;

  constructor() {
    if (!process.env.VIDEO_GEN_URL) {
      throw new Error('❌ VIDEO_GEN_URL no definido en .env');
    }
    // Normalizamos para evitar que quede con "/" al final
    this.baseUrl = process.env.VIDEO_GEN_URL.replace(/\/$/, '');
    this.logger.log(`PromptJsonService initialized with baseUrl: ${this.baseUrl}`);
  }

  async generatePromptJson(prompt: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/llm/generate-json`;
      this.logger.log(`🔗 Llamando a video-generator → ${url} with prompt: ${prompt}`);

      const response = await axios.post(url, { prompt });
      this.logger.log(`Received response from video-generator: ${JSON.stringify(response.data)}`);

      if (!response.data?.success) {
        this.logger.error(`Video-generator responded with error: ${JSON.stringify(response.data)}`);
        throw new HttpException(
          'Video-generator respondió con error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const raw = response.data.result.promptJson;
      this.logger.log(`Raw promptJson from video-generator: ${raw}`);
      let parsed: any;

      try {
        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        this.logger.log(`Successfully parsed JSON: ${JSON.stringify(parsed)}`);
      } catch (parseError) {
        this.logger.error('❌ Error al parsear promptJson:', parseError);
        throw new HttpException(
          'Error al parsear el prompt JSON devuelto por video-generator',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return parsed;
    } catch (error: any) {
      this.logger.error('❌ Error al generar prompt JSON:', error?.message || error);
      if (error.response) {
        this.logger.error(`Error response from video-generator: ${JSON.stringify(error.response.data)}`);
      }
      throw new HttpException(
        'Error comunicándose con video-generator',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}