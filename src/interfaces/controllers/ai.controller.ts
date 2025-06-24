import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from '../../infrastructure/services/ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-promo')
  async generatePromo(@Body('prompt') prompt: string) {
    const result = await this.aiService.generatePromo(prompt);
    return { result };
  }
}
