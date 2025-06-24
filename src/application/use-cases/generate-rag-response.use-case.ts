import { Injectable } from '@nestjs/common';
import { RagService } from '../../infrastructure/services/rag.service';

@Injectable()
export class GenerateRagResponseUseCase {
  constructor(private readonly ragService: RagService) {}

  async execute(prompt: string): Promise<string> {
    return await this.ragService.generateWithOpenAI(prompt);
  }
}
