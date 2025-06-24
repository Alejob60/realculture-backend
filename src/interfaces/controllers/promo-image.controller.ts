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

const PLAN_CREDITS = {
  'promo-image': {
    FREE: 10,
    CREATOR: 15,
    PRO: 10,
  },
  // Puedes agregar otros servicios aquí también
};

@Controller('api/promo-image')
export class PromoImageController {
  constructor(
    private readonly mediaBridge: MediaBridgeService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async generatePromoImage(@Body() body: any, @Req() req: Request) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = (req as any).user?.userId;

    if (!token || !userId) {
      throw new HttpException(
        'Token inválido o usuario no identificado',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userService.findById(userId);
    const userPlan = user?.role || 'FREE';

    const serviceKey = 'promo-image';
    const requiredCredits = PLAN_CREDITS[serviceKey]?.[userPlan] ?? null;

    if (requiredCredits === null) {
      throw new HttpException(
        'Tu plan no permite generar imágenes promocionales',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!user || user.credits < requiredCredits) {
      throw new HttpException('Créditos insuficientes', HttpStatus.FORBIDDEN);
    }

    // ✅ Generación en microservicio
    const result = await this.mediaBridge.generatePromoImage(body);

    // ✅ Descuento y respuesta actualizada
    const updatedUser = await this.userService.decrementCredits(userId, 10);
    /*  await this.mediaBridge.saveImageToGallery({
      userId,
      prompt: result?.result?.prompt,
      imageUrl: result?.result?.imageUrl,
    }); */
    if (!updatedUser) {
      throw new NotFoundException(
        'No se pudo actualizar los créditos del usuario',
      );
    }

    return {
      ...(result || {}),
      credits: updatedUser.credits,
    };
  }
}
