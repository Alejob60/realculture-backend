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
import { MediaBridgeService } from '../../infrastructure/services/media-bridge.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.services';

const PLAN_CREDITS = {
  'promo-image': {
    FREE: 10,
    CREATOR: 15,
    PRO: 10,
  },
};

@Controller('promo-image')
export class PromoImageController {
  private readonly logger = new Logger(PromoImageController.name);

  constructor(
    private readonly mediaBridge: MediaBridgeService,
    private readonly userService: UserService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async generatePromoImage(@Body() body: any, @Req() req: Request) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = (req as any).user?.userId;

      if (!token || !userId) {
        throw new HttpException(
          'Token inválido o usuario no identificado',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const userPlan = user.role || 'FREE';
      const serviceKey = 'promo-image';
      const requiredCredits = PLAN_CREDITS[serviceKey]?.[userPlan] ?? null;

      if (requiredCredits === null) {
        throw new HttpException(
          'Tu plan no permite generar imágenes promocionales',
          HttpStatus.FORBIDDEN,
        );
      }

      if (user.credits < requiredCredits) {
        throw new HttpException('Créditos insuficientes', HttpStatus.FORBIDDEN);
      }

      if (!body?.prompt || typeof body.prompt !== 'string' || body.prompt.trim() === '') {
        throw new HttpException('Prompt inválido o vacío', HttpStatus.BAD_REQUEST);
      }

      const result = await this.mediaBridge.generatePromoImage({
        prompt: body.prompt,
        plan: userPlan,
      }, token);

      if (!result || !result.result) {
        throw new HttpException(
          'Error al generar la imagen',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let fileName: string | undefined = undefined;
      if (result.result.fileName) {
        fileName = result.result.fileName;
      } else if (result.result.imageUrl) {
        const url = new URL(result.result.imageUrl);
        const parts = url.pathname.split('/');
        if (parts.length >= 3) {
          fileName = parts.slice(2).join('/');
        }
      }

      if (!fileName) {
        throw new HttpException(
          'Error interno: archivo generado no identificado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const signedUrl = await this.azureBlobService.getSignedUrl(fileName, 86400);

      const responseResult = {
        ...result.result,
        signedUrl,
        imageUrl: signedUrl,
      };

      const updatedUser = await this.userService.decrementCredits(userId, requiredCredits);
      if (!updatedUser) {
        throw new NotFoundException('No se pudo actualizar los créditos del usuario');
      }

      return {
        success: true,
        result: responseResult,
        credits: updatedUser.credits,
      };
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