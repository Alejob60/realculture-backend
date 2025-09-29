import {
  Controller,
  Post,
  Get,
  Req,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { UserEntity } from '../../domain/entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('credits')
@Controller('credits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CreditsController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @Post('/buy')
  @ApiOperation({ summary: 'Buy credits' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Credits purchased successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async buyCredits(@Req() req: Request, @Body() body: { amount: number }) {
    const user = req.user as UserEntity;
    if (!user || typeof user.credits !== 'number') {
      throw new UnauthorizedException('Usuario no autenticado o mal definido');
    }

    user.credits += body.amount;
    await this.userRepository.save(user);

    return {
      message: `Compraste ${body.amount} créditos`,
      totalCredits: user.credits,
    };
  }

  @Get('/available')
  @ApiOperation({ summary: 'Get available credits' })
  @ApiResponse({ status: 200, description: 'Returns available credits.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCredits(@Req() req: Request) {
    const user = req.user as UserEntity;
    if (!user || typeof user.credits !== 'number') {
      throw new UnauthorizedException('Usuario no autenticado o mal definido');
    }

    return { credits: user.credits };
  }
}