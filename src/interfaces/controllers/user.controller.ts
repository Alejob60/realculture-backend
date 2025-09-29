import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  Patch,
  Body,
  BadRequestException,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestWithUser } from 'src/types/request-with-user';
import { GeneratedImageService } from '../../infrastructure/services/generated-image.service';
import { UserService } from '../../infrastructure/services/user.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly imageService: GeneratedImageService,
  ) {}

  @Get('credits')
  @ApiOperation({ summary: 'Get user credits' })
  @ApiResponse({ status: 200, description: 'Returns the user credits.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCredits(@Req() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.userService.getCredits(userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getProfile(@Req() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.userService.findById(userId);
  }

  @Get('images')
  @ApiOperation({ summary: 'Get user images' })
  @ApiResponse({ status: 200, description: 'Returns the user images.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getUserImages(
    @Req() req: RequestWithUser,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.imageService.getImagesByUserId(userId, paginationDto);
  }

  @Patch('admin/set-credits')
  @ApiOperation({ summary: 'Set user credits (admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        credits: { type: 'number', example: 100 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Credits updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
  @ApiOperation({ summary: 'Decrement user credits' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Credits decremented successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
  @ApiOperation({ summary: 'Upgrade user plan' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPlan: { type: 'string', example: 'PRO', enum: ['CREATOR', 'PRO'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Plan upgraded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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