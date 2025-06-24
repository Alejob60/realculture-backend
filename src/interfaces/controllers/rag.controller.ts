import { Controller, Post, Body } from '@nestjs/common';
import { RagService } from '../../infrastructure/services/rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('respond')
  async respond(@Body('prompt') prompt: string) {
    const answer = await this.ragService.generateWithOpenAI(prompt);
    return { answer };
  }
}
