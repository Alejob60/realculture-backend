import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  Patch,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestWithUser } from 'src/types/request-with-user';
import { GeneratedImageService } from '../../infrastructure/services/generated-image.service';
import { UserService } from 'src/infrastructure/services/user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly imageService: GeneratedImageService,
  ) {}

  @Get('credits')
  async getCredits(@Req() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.userService.getCredits(userId);
  }

  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.userService.findById(userId);
  }

  @Get('images')
  async getUserImages(@Req() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.imageService.getImagesByUserId(userId);
  }

  @Patch('admin/set-credits')
  async setCredits(
    @Req() req: RequestWithUser,
    @Body() body: { credits: number },
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('No autenticado');
    }

    if (typeof body.credits !== 'number' || body.credits < 0) {
      throw new BadRequestException('Créditos inválidos');
    }

    await this.userService.setCredits(userId, body.credits);
    return {
      success: true,
      message: `✅ Créditos actualizados a ${body.credits}`,
    };
  }

  @Patch('decrement-credits')
  async decrementCredits(
    @Req() req: RequestWithUser,
    @Body() body: { amount: number },
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('No autenticado');
    }

    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException(
        'El monto a descontar debe ser mayor que 0',
      );
    }

    const updatedUser = await this.userService.decrementCredits(
      userId,
      body.amount,
    );

    return {
      message: `Se descontaron ${body.amount} créditos correctamente.`,
      credits: updatedUser.credits,
    };
  }
  @Patch('upgrade')
  async upgradePlan(
    @Req() req: RequestWithUser,
    @Body() body: { newPlan: 'CREATOR' | 'PRO' },
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('No autenticado');
    }

    const { newPlan } = body;

    if (!['CREATOR', 'PRO'].includes(newPlan)) {
      throw new BadRequestException('Plan inválido');
    }

    const result = await this.userService.upgradePlan(userId, newPlan);

    return {
      message: '✅ Plan actualizado exitosamente',
      plan: result.plan,
      credits: result.newCredits,
    };
  }
}
