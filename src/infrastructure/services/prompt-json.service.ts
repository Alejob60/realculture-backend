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
      this.logger.log(`Validating prompt: "${prompt}"`);
      
      // Validate the prompt before sending it to the video-generator service
      if (!prompt || typeof prompt !== 'string') {
        this.logger.warn(`Invalid prompt type: ${typeof prompt}`);
        throw new HttpException(
          'El prompt es requerido y debe ser una cadena de texto',
          HttpStatus.BAD_REQUEST,
        );
      }
      
      // Trim whitespace and check length
      const trimmedPrompt = prompt.trim();
      this.logger.log(`Trimmed prompt: "${trimmedPrompt}" (length: ${trimmedPrompt.length})`);
      
      if (trimmedPrompt.length < 5) {
        this.logger.warn(`Prompt too short: ${trimmedPrompt.length} characters`);
        throw new HttpException(
          'El prompt debe tener al menos 5 caracteres',
          HttpStatus.BAD_REQUEST,
        );
      }
      
      const url = `${this.baseUrl}/llm/generate-json`;
      this.logger.log(`🔗 Llamando a video-generator → ${url} with prompt: ${trimmedPrompt}`);

      const response = await axios.post(url, { prompt: trimmedPrompt });
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
        // If it's a validation error from the video-generator, pass it through
        if (error.response.status === 400) {
          throw new HttpException(
            error.response.data.message || 'Error de validación en video-generator',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      // Re-throw HttpExceptions as they are
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error comunicándose con video-generator',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}