
import { Module } from '@nestjs/common';
import { AiController } from '../../interfaces/controllers/ai.controller';
import { AiService } from '../services/ai.service';
import { RagController } from '../../interfaces/controllers/rag.controller';
import { RagService } from '../services/rag.service';
import { GenerateRagResponseUseCase } from '../../application/use-cases/generate-rag-response.use-case';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AiController, RagController],
  providers: [AiService, RagService, GenerateRagResponseUseCase],
})
export class AiModule {}
