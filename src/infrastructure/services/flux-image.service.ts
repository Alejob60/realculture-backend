import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { AzureBlobService } from './azure-blob.services';

@Injectable()
export class FluxImageService {
  private readonly logger = new Logger(FluxImageService.name);
  private readonly fluxApiUrl: string;
  private readonly fluxApiKey: string;

  constructor(public readonly azureBlobService: AzureBlobService) {
    this.fluxApiUrl = process.env.FLUX_API_URL || 'https://api.flux.com/v1';
    this.fluxApiKey = process.env.FLUX_API_KEY || '';
    
    if (!this.fluxApiKey || this.fluxApiKey === 'your-flux-api-key-here') {
      this.logger.warn('FLUX_API_KEY not properly configured. FLUX functionality will be simulated.');
    }
  }

  async generateImage(prompt: string, options?: { 
    width?: number; 
    height?: number; 
    steps?: number;
    guidance?: number;
  }): Promise<{ imageUrl: string; fileName: string }> {
    try {
      // For testing purposes, simulate FLUX API response when key is not properly configured
      if (!this.fluxApiKey || this.fluxApiKey === 'your-flux-api-key-here') {
        this.logger.log(`Simulating FLUX image generation for prompt: ${prompt}`);
        
        // Create a simulated image (in a real scenario, this would be an actual image)
        const imageBuffer = Buffer.from('simulated-image-data');
        const fileName = `flux-images/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const containerName = process.env.AZURE_STORAGE_CONTAINER_IMAGES || 'images';
        
        const blobUrl = await this.azureBlobService.uploadBufferToContainer(
          imageBuffer,
          fileName,
          containerName,
          'image/png'
        );

        this.logger.log(`Simulated FLUX image uploaded to Azure Blob Storage: ${fileName}`);
        
        return {
          imageUrl: blobUrl,
          fileName,
        };
      }

      this.logger.log(`Generating image with FLUX-1.1-pro for prompt: ${prompt}`);
      
      const response = await axios.post(
        `${this.fluxApiUrl}/images/generations`,
        {
          prompt,
          model: 'FLUX-1.1-pro',
          width: options?.width || 1024,
          height: options?.height || 1024,
          steps: options?.steps || 25,
          guidance: options?.guidance || 3.5,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.fluxApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const imageUrl = response.data.data?.[0]?.url;
      if (!imageUrl) {
        throw new HttpException(
          'Invalid response from FLUX API',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Download the image and upload to Azure Blob Storage
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      
      const fileName = `flux-images/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      const containerName = process.env.AZURE_STORAGE_CONTAINER_IMAGES || 'images';
      
      const blobUrl = await this.azureBlobService.uploadBufferToContainer(
        imageBuffer,
        fileName,
        containerName,
        'image/png'
      );

      this.logger.log(`FLUX image uploaded to Azure Blob Storage: ${fileName}`);
      
      return {
        imageUrl: blobUrl,
        fileName,
      };
    } catch (error) {
      this.logger.error('Error generating image with FLUX:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error generating image with FLUX-1.1-pro',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}