// src/api/controllers/promo-image.controller.ts

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
  // Puedes añadir otros servicios y sus créditos por plan aquí
};

@Controller('api/v1/promo-image')
export class PromoImageController {
  private readonly logger = new Logger(PromoImageController.name);

  constructor(
    private readonly mediaBridge: MediaBridgeService,
    private readonly userService: UserService,
    private readonly azureBlobService: AzureBlobService, // Inyectamos el servicio para SAS
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async generatePromoImage(@Body() body: any, @Req() req: Request) {
    try {
      // Extraer token y userId del request
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = (req as any).user?.userId;

      if (!token || !userId) {
        this.logger.warn('Token inválido o usuario no identificado');
        throw new HttpException(
          'Token inválido o usuario no identificado',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Buscar usuario en base de datos
      const user = await this.userService.findById(userId);
      if (!user) {
        this.logger.warn(`Usuario no encontrado: ${userId}`);
        throw new NotFoundException('Usuario no encontrado');
      }

      // Obtener plan y créditos requeridos para promo-image
      const userPlan = user.role || 'FREE';
      const serviceKey = 'promo-image';
      const requiredCredits = PLAN_CREDITS[serviceKey]?.[userPlan] ?? null;

      if (requiredCredits === null) {
        this.logger.warn(`Plan no permite generar imágenes promocionales: ${userPlan}`);
        throw new HttpException(
          'Tu plan no permite generar imágenes promocionales',
          HttpStatus.FORBIDDEN,
        );
      }

      // Verificar que el usuario tenga créditos suficientes
      if (user.credits < requiredCredits) {
        this.logger.warn(
          `Créditos insuficientes para usuario ${userId}: tiene ${user.credits}, requiere ${requiredCredits}`,
        );
        throw new HttpException('Créditos insuficientes', HttpStatus.FORBIDDEN);
      }

      // Validar que el prompt venga en el body y sea string
      if (!body?.prompt || typeof body.prompt !== 'string' || body.prompt.trim() === '') {
        this.logger.warn(`Prompt inválido o vacío`);
        throw new HttpException('Prompt inválido o vacío', HttpStatus.BAD_REQUEST);
      }

      // Llamada al microservicio para generar la imagen promocional
      const result = await this.mediaBridge.generatePromoImage({
        prompt: body.prompt,
        plan: userPlan,  // <-- este valor debe enviarse
      }, token);

      if (!result || !result.result) {
        this.logger.error('No se recibió resultado de generación de imagen');
        throw new HttpException(
          'Error al generar la imagen',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Extraer filename o path relativo dentro del contenedor (ejemplo: 'promo-images/abc123.jpg')
      let fileName: string | undefined = undefined;

      if (result.result.fileName) {
        fileName = result.result.fileName;
      } else if (result.result.imageUrl) {
        // Si viene la URL completa, extraemos solo la ruta relativa para generar SAS
        // Suponiendo que la URL tiene el formato https://{account}.blob.core.windows.net/{container}/{fileName}
        const url = new URL(result.result.imageUrl);
        const parts = url.pathname.split('/');
        // parts[0] = "", parts[1] = container, parts[2..] = file path
        if (parts.length >= 3) {
          fileName = parts.slice(2).join('/');
        }
      }

      if (!fileName) {
        this.logger.error('No se pudo determinar el nombre del archivo para generar SAS');
        throw new HttpException(
          'Error interno: archivo generado no identificado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Obtener URL firmada SAS válida (ejemplo, 24 horas = 86400 segundos)
      const signedUrl = await this.azureBlobService.getSignedUrl(fileName, 86400);

      // Actualizamos la respuesta con la URL firmada
      const responseResult = {
        ...result.result,
        signedUrl,
        imageUrl: signedUrl, // Sobrescribimos para que el frontend use la URL SAS
      };

      // Descontar créditos al usuario
      const updatedUser = await this.userService.decrementCredits(userId, requiredCredits);
      if (!updatedUser) {
        this.logger.error(`No se pudo actualizar créditos para usuario ${userId}`);
        throw new NotFoundException('No se pudo actualizar los créditos del usuario');
      }

      // Retornar resultado junto con créditos actualizados
      return {
        success: true,
        result: responseResult,
        credits: updatedUser.credits,
      };
    } catch (error: any) {
      this.logger.error('Error en generatePromoImage:', error?.message || error);

      // Re-lanzar excepciones HTTP para que Nest las maneje correctamente
      if (error instanceof HttpException) {
        throw error;
      }

      // Para errores inesperados, enviar error genérico 500
      throw new HttpException(
        'Error interno del servidor al procesar la solicitud',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
