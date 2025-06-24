import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  async fetchContextFromAzureSearch(prompt: string): Promise<string> {
    try {
      const response = await axios.post<any>(
        `https://${process.env.AZURE_SEARCH_SERVICE}.search.windows.net/indexes/${process.env.AZURE_SEARCH_INDEX}/docs/search?api-version=2021-04-30-Preview`,
        {
          search: prompt,
          top: 3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_SEARCH_API_KEY,
          },
        },
      );

      const docs = response.data.value;
      const context = docs.map((doc: any) => `• ${doc.content}`).join('\n\n');
      return (
        context || 'Sin resultados relevantes en la base de conocimientos.'
      );
    } catch (error) {
      this.logger.error(
        '❌ Error consultando Azure Cognitive Search',
        error.message,
      );
      return 'Error al recuperar el contexto.';
    }
  }

  async generateWithOpenAI(prompt: string): Promise<string> {
    const context = await this.fetchContextFromAzureSearch(prompt);

    try {
      const response = await axios.post(
        `${process.env.OPENAI_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-02-15-preview`,
        {
          messages: [
            {
              role: 'system',
              content:
                'Responde como un influencer virtual carismático, creativo y motivador. Usa lenguaje actual, fresco y cercano a la audiencia joven.',
            },
            {
              role: 'user',
              content: `Contexto:\n${context}`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 800,
        },
        {
          headers: {
            'api-key': process.env.OPENAI_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      return (response.data as any).choices[0].message.content;
    } catch (error) {
      this.logger.error(
        '❌ Error generando respuesta con OpenAI GPT-4o',
        error.message,
      );
      return 'No fue posible generar una respuesta en este momento.';
    }
  }
}
