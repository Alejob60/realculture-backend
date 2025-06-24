import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as path from 'path';

@Injectable()
export class PromoImageService {
  private readonly logger = new Logger(PromoImageService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly httpService: HttpService,
  ) {}

  async generatePromoImage(userId: string, prompt: string) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) throw new ForbiddenException('Usuario no encontrado');

    const isFree = user.plan === 'FREE';
    const cost = 10;

    if (isFree && user.credits < cost) {
      throw new ForbiddenException('No tienes suficientes créditos');
    }

    // Descontar créditos si aplica
    if (isFree) {
      user.credits -= cost;
      await this.userRepository.save(user);
    }

    // Llamada al microservicio de generación de imagen
    const microserviceURL = 'http://localhost:4000/image/promo';
    const response = await firstValueFrom(
      this.httpService.post(microserviceURL, { prompt }),
    );

    const data = response.data;
    const imageUrl = data.imageUrl;
    const improvedPrompt = data.prompt || prompt;
    const filename = path.basename(imageUrl); // Extraer nombre del archivo

    return {
      status: 'ok',
      usedCredits: isFree ? cost : 0,
      prompt: improvedPrompt,
      imageUrl,
      filename,
    };
  }
}
