// src/api/promo-image/promo-image.controller.ts
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
import { JwtAuthGuard } from '../../interfaces/guards/jwt-auth.guard';
import { Request } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { AzureBlobService } from './azure-blob.services';

const PLAN_CREDITS = {
  'promo-image': {
    FREE: 10,
    CREATOR: 15,
    PRO: 10,
  },
};

@Controller('api/v1/promo-image')
export class PromoImageController {
  private readonly logger = new Logger(PromoImageController.name);

  constructor(
    private readonly mediaBridge: MediaBridgeService,
    private readonly userService: UserService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async generatePromoImage(@Body() body: { prompt: string; plan: string }, @Req() req: Request) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = (req as any).user?.userId;

      if (!token || !userId) {
        throw new HttpException('Token inválido o usuario no identificado', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.userService.findById(userId);
      const userPlan = user?.role || 'FREE';

      const serviceKey = 'promo-image';
      const requiredCredits = PLAN_CREDITS[serviceKey]?.[userPlan] ?? null;

      if (requiredCredits === null) {
        throw new HttpException('Tu plan no permite generar imágenes promocionales', HttpStatus.FORBIDDEN);
      }

      if (!user || user.credits < requiredCredits) {
        throw new HttpException('Créditos insuficientes', HttpStatus.FORBIDDEN);
      }

      // Llamar al microservicio que genera la imagen
      const result = await this.mediaBridge.generatePromoImage(body, token);

      // El microservicio debería devolver el nombre o ruta del archivo blob, por ejemplo:
      // result.result.fileName = "promo-images/abc123.jpg"
      const fileName = result?.result?.fileName;
      if (!fileName) {
        throw new HttpException('No se recibió el nombre del archivo generado', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Obtener la URL SAS firmada para ese blob
      const signedUrl = await this.azureBlobService.getSignedUrl(fileName, 3600 * 24); // 24 horas de validez

      // Actualizar créditos del usuario
      const updatedUser = await this.userService.decrementCredits(userId, requiredCredits);
      if (!updatedUser) {
        throw new NotFoundException('No se pudo actualizar los créditos del usuario');
      }

      return {
        success: true,
        result: {
          signedUrl,
          prompt: body.prompt,
          fileName,
        },
        credits: updatedUser.credits,
      };
    } catch (error: any) {
      this.logger.error('Error en generatePromoImage:', error);
      throw error;
    }
  }
}
