import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RagService } from '../../infrastructure/services/rag.service';

@ApiTags('rag')
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('respond')
  @ApiOperation({ summary: 'Generate response using RAG' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', example: 'Explain quantum computing in simple terms' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns the generated response.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async respond(@Body('prompt') prompt: string) {
    const answer = await this.ragService.generateWithOpenAI(prompt);
    return { answer };
  }
}