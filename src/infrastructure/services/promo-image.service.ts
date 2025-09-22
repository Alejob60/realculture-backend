import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MediaBridgeService } from './media-bridge.service';
import { AzureBlobService } from './azure-blob.services';
import { ContentService } from './content.service';
import { GeneratePromoImageDto } from '../../interfaces/dto/generate-promo-image.dto';
import { ImageResult, ImageResponse, DualImageResult, SingleImageResult } from '../../interfaces/dto/image-response.dto';

@Injectable()
export class PromoImageService {
  private readonly logger = new Logger(PromoImageService.name);

  constructor(
    private readonly mediaBridgeService: MediaBridgeService,
    private readonly azureBlobService: AzureBlobService,
    private readonly contentService: ContentService,
  ) {}

  async generateAndNotify(
    userId: string,
    dto: GeneratePromoImageDto,
    token?: string,
  ) {
    try {
      this.logger.log(`Generating promo image for user ${userId}`);
      
      // Use the prompt or a default value if not provided
      const prompt = dto.prompt && dto.prompt.trim() !== '' ? dto.prompt : 'Default image prompt';
      
      // Handle dual image mode
      if (dto.dualImageMode) {
        this.logger.log(`Generating dual images for user ${userId}`);
        
        // Generate both DALL-E and FLUX images with error handling
        const dallePromise = this.generateDalleImage(userId, { ...dto, useFlux: false }, token, prompt).catch(error => {
          this.logger.error('Error generating DALL-E image in dual mode:', error);
          return { error: 'DALL-E generation failed', details: error.message || error };
        });
        
        const fluxPromise = this.generateDalleImage(userId, { ...dto, useFlux: true }, token, prompt).catch(error => {
          this.logger.error('Error generating FLUX image in dual mode:', error);
          return { error: 'FLUX generation failed', details: error.message || error };
        });
        
        const [dalleResult, fluxResult] = await Promise.all([dallePromise, fluxPromise]);
        
        const images: ImageResponse[] = [];
        const savePromises: Promise<void>[] = [];
        const errors: any[] = [];
        
        // Check if DALL-E result is an error or a successful image
        if ('error' in dalleResult) {
          errors.push(dalleResult);
        } else {
          images.push({
            type: 'dalle',
            signedUrl: dalleResult.signedUrl,
            imageUrl: dalleResult.imageUrl,
            fileName: dalleResult.fileName,
            prompt: prompt
          });
          savePromises.push(this.saveContentToDatabase(userId, 'image', prompt, dalleResult.imageUrl, new Date()));
        }
        
        // Check if FLUX result is an error or a successful image
        if ('error' in fluxResult) {
          errors.push(fluxResult);
        } else {
          images.push({
            type: 'flux',
            signedUrl: fluxResult.signedUrl,
            imageUrl: fluxResult.imageUrl,
            fileName: fluxResult.fileName,
            prompt: prompt
          });
          savePromises.push(this.saveContentToDatabase(userId, 'image', prompt, fluxResult.imageUrl, new Date()));
        }
        
        // If both failed, throw an error with details
        if (images.length === 0) {
          throw new HttpException(
            {
              message: 'Failed to generate any images',
              errors: errors
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        
        // Save successful images to the database
        await Promise.all(savePromises);
        
        // Return partial success if only one image was generated
        if (errors.length > 0) {
          return {
            success: true,
            message: 'Partial success - some images failed to generate',
            errors: errors,
            result: {
              images,
              dualImageMode: true
            } as DualImageResult
          };
        }
        
        return {
          success: true,
          result: {
            images,
            dualImageMode: true
          } as DualImageResult
        };
      } else if (dto.useFlux) {
        // Generate FLUX image only through the video-generator service
        this.logger.log(`Generating FLUX image for user ${userId}`);
        const fluxResult = await this.generateDalleImage(userId, dto, token, prompt);
        
        // Save to database
        await this.saveContentToDatabase(userId, 'image', prompt, fluxResult.imageUrl, new Date());
        
        return {
          success: true,
          result: {
            signedUrl: fluxResult.signedUrl,
            imageUrl: fluxResult.imageUrl,
            fileName: fluxResult.fileName,
            prompt: prompt,
            useFlux: true
          } as SingleImageResult
        };
      } else {
        // Generate DALL-E image through the video-generator service
        this.logger.log(`Generating DALL-E image for user ${userId}`);
        const dalleResult = await this.generateDalleImage(userId, dto, token, prompt);
        
        // Save to database
        await this.saveContentToDatabase(userId, 'image', prompt, dalleResult.imageUrl, new Date());
        
        return {
          success: true,
          result: {
            signedUrl: dalleResult.signedUrl,
            imageUrl: dalleResult.imageUrl,
            fileName: dalleResult.fileName,
            prompt: prompt,
            useFlux: false
          } as SingleImageResult
        };
      }
    } catch (error) {
      this.logger.error('Error in generateAndNotify:', error);
      throw new HttpException(
        {
          message: 'Error generating promotional image',
          details: error.message || 'Unknown error occurred',
          ...(error.getResponse ? error.getResponse() : {})
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateDalleImage(
    userId: string,
    dto: GeneratePromoImageDto,
    token: string | undefined,
    prompt: string,
  ): Promise<ImageResult> {
    try {
      // Call the media bridge service to generate the image
      const result = await this.mediaBridgeService.generatePromoImage(
        {
          prompt: prompt,
          jsonPrompt: dto.jsonPrompt,
          plan: 'PRO', // Default plan for image generation
          textOverlay: dto.textOverlay,
          useFlux: dto.useFlux,
        },
        token,
      );

      // The microservice should return the file name, for example:
      // result.result.filename = "promo-images/abc123.jpg"
      // Handle both filename and fileName variations
      const fileName = result?.result?.filename || result?.result?.fileName;
      if (!fileName) {
        throw new HttpException(
          'No file name received from image generation service',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Get the signed URL for that blob
      const signedUrl = await this.azureBlobService.getSignedUrl(
        fileName,
        3600 * 24,
      ); // 24 hours validity

      // Construct the image URL using the Azure Blob Storage account information
      const containerName = process.env.AZURE_STORAGE_CONTAINER_IMAGES || 'images';
      const accountName = process.env.AZURE_STORAGE_ACCOUNT;
      const imageUrl = accountName 
        ? `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}`
        : signedUrl; // Fallback to signed URL if account name is not available

      return {
        signedUrl,
        imageUrl,
        fileName,
      };
    } catch (error) {
      this.logger.error('Error generating image:', error);
      // Re-throw the error with more context
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Error generating promotional image',
          details: error.message || 'Unknown error occurred during image generation',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async saveContentToDatabase(
    userId: string,
    type: 'image' | 'audio' | 'video' | 'text' | 'other',
    prompt: string,
    url: string,
    createdAt: Date,
  ): Promise<void> {
    try {
      this.logger.log(`Saving ${type} content to database for user: ${userId}`);
      
      await this.contentService.save({
        userId,
        type,
        prompt,
        url,
        status: 'completed',
        createdAt,
      });
      
      this.logger.log(`Successfully saved ${type} content to database for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error saving ${type} content to database for user ${userId}:`, error);
      // We don't throw the error here to avoid breaking the image generation process
      // but we do log it for debugging purposes
    }
  }
}