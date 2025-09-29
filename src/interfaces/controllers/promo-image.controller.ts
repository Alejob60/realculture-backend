import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { RequestWithUser } from 'src/types/request-with-user';
import { PromoImageService } from '../../infrastructure/services/promo-image.service';
import { GeneratePromoImageDto } from '../dto/generate-promo-image.dto';

const PLAN_CREDITS = {
  'promo-image': {
    FREE: 10,
    CREATOR: 15,
    PRO: 10,
  },
};

@ApiTags('promo-image')
@Controller('promo-image')
@UseGuards(JwtAuthGuard)
export class PromoImageController {
  private readonly logger = new Logger(PromoImageController.name);

  constructor(
    private readonly promoImageService: PromoImageService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Generate promotional image from prompt',
    description: 'Generate a promotional image using either DALL-E or FLUX-1.1-pro. When dualImageMode is true, generates both DALL-E and FLUX images.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { 
          type: 'string', 
          example: 'A beautiful landscape with mountains and lakes' 
        },
        jsonPrompt: { 
          type: 'object', 
          example: { 
            scene: 'Mountain landscape', 
            characters: [],
            camera: 'Wide angle',
            lighting: 'Natural',
            style: 'Photorealistic',
            interactionFocus: 'Lake reflection'
          }, 
          description: 'JSON prompt for image generation' 
        },
        textOverlay: { 
          type: 'string', 
          example: 'Special Offer', 
          description: 'Text to overlay on the image' 
        },
        useFlux: {
          type: 'boolean',
          example: true,
          description: 'Use FLUX-1.1-pro instead of DALL-E (only applies when dualImageMode is false)'
        },
        dualImageMode: {
          type: 'boolean',
          example: true,
          description: 'Generate both DALL-E and FLUX images. When true, ignores useFlux flag and generates both images, consuming 20 credits.'
        }
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Promotional image generated successfully.',
    content: {
      'application/json': {
        examples: {
          'single_image': {
            summary: 'Single image response',
            value: {
              success: true,
              result: {
                signedUrl: 'https://realculturestorage.blob.core.windows.net/images/...',
                imageUrl: 'https://realculturestorage.blob.core.windows.net/images/...',
                fileName: 'images/generated-image.png',
                prompt: 'A beautiful landscape',
                useFlux: false
              },
              credits: 90
            }
          },
          'dual_image': {
            summary: 'Dual image response',
            value: {
              success: true,
              result: {
                images: [
                  {
                    type: 'dalle',
                    signedUrl: 'https://realculturestorage.blob.core.windows.net/images/...',
                    imageUrl: 'https://realculturestorage.blob.core.windows.net/images/...',
                    fileName: 'images/dalle-image.png',
                    prompt: 'A beautiful landscape'
                  },
                  {
                    type: 'flux',
                    signedUrl: 'https://realculturestorage.blob.core.windows.net/flux-images/...',
                    imageUrl: 'https://realculturestorage.blob.core.windows.net/flux-images/...',
                    fileName: 'flux-images/flux-image.png',
                    prompt: 'A beautiful landscape'
                  }
                ],
                dualImageMode: true
              },
              credits: 80
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async generatePromoImage(@Body() dto: GeneratePromoImageDto, @Req() req: RequestWithUser) {
    try {
      // Extract userId from the properly typed user object
      const userId = req.user?.id;
      this.logger.log(`Extracted userId from request: ${userId}`);

      // Validate user object and userId
      if (!req.user) {
        this.logger.error('User object is undefined in request');
        throw new HttpException('Usuario no identificado', HttpStatus.UNAUTHORIZED);
      }
      
      if (!userId) {
        this.logger.error('User ID is undefined in request');
        throw new HttpException('ID de usuario no encontrado', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const userPlan = user.role || 'FREE';
      const serviceKey = 'promo-image';
      
      // For dual image mode, we need 20 credits (10 for each image)
      const requiredCredits = dto.dualImageMode ? 
        (PLAN_CREDITS[serviceKey]?.[userPlan] ?? 0) * 2 : 
        PLAN_CREDITS[serviceKey]?.[userPlan] ?? null;

      if (requiredCredits === null) {
        throw new HttpException(
          'Tu plan no permite generar imágenes promocionales',
          HttpStatus.FORBIDDEN,
        );
      }

      if (user.credits < requiredCredits) {
        throw new HttpException('Créditos insuficientes', HttpStatus.FORBIDDEN);
      }

      // Validate that either prompt or jsonPrompt is provided
      if ((!dto?.prompt || typeof dto.prompt !== 'string' || dto.prompt.trim() === '') && 
          (!dto?.jsonPrompt || typeof dto.jsonPrompt !== 'object')) {
        throw new HttpException('Debe proporcionar un prompt o jsonPrompt válido', HttpStatus.BAD_REQUEST);
      }

      // Get token from request headers
      const authHeader = req.headers['authorization'];
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      
      // Generate image using the service
      const result = await this.promoImageService.generateAndNotify(userId, dto, token);

      // Only update user credits if generation was successful
      if (result.success) {
        const updatedUser = await this.userService.decrementCredits(userId, requiredCredits);
        if (!updatedUser) {
          throw new NotFoundException('No se pudo actualizar los créditos del usuario');
        }

        return {
          ...result,
          credits: updatedUser.credits,
        };
      } else {
        // If generation failed, we shouldn't deduct credits
        throw new HttpException(
          'Error al generar la imagen promocional',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error: any) {
      this.logger.error('Error en generatePromoImage:', error?.message || error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error interno del servidor al procesar la solicitud',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}