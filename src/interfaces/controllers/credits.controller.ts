import {
  Controller,
  Post,
  Get,
  Req,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { UserEntity } from '../../domain/entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @Post('/buy')
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
  async getCredits(@Req() req: Request) {
    const user = req.user as UserEntity;
    if (!user || typeof user.credits !== 'number') {
      throw new UnauthorizedException('Usuario no autenticado o mal definido');
    }

    return { credits: user.credits };
  }
}
