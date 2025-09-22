import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AiService } from '../../infrastructure/services/ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-promo')
  @ApiOperation({ summary: 'Generate promotional content' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', example: 'Create a promotional message for a new product' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Promotional content generated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async generatePromo(@Body('prompt') prompt: string) {
    const result = await this.aiService.generatePromo(prompt);
    return { result };
  }
}