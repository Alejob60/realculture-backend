import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserService } from '../../infrastructure/services/user.service';

@Injectable()
export class UseServiceUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(
    userId: string,
    service:
      | 'image'
      | 'video'
      | 'tts'
      | 'subtitles'
      | 'ai-agent'
      | 'voice'
      | 'music'
      | 'agent',
  ) {
    const costMap = {
      image: 10,
      video: 25,
      tts: 10,
      voice: 10,
      music: 15,
      subtitles: 5,
      'ai-agent': 150,
      agent: 150, // si aún lo usas
    };

    const user = await this.userService.findById(userId); // Ensure findById exists and returns a typed User object
    if (!user) {
      throw new ForbiddenException('Usuario no encontrado');
    }
    const cost = costMap[service];

    if (user.role === 'FREE' && service === 'ai-agent') {
      throw new ForbiddenException(
        'Este servicio solo está disponible en planes de pago.',
      );
    }

    if (user.credits < cost) {
      throw new ForbiddenException('Créditos insuficientes');
    }

    user.credits -= cost;
    await this.userService.save(user);
    return user.credits;
  }
}
