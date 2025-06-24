import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly deployment: string;
  private readonly apiVersion: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY')!;
    this.endpoint = this.configService.get<string>('OPEN_API_ENDPOINT')!;
    this.deployment = this.configService.get<string>('OPENAI_DEPLOYMENT_NAME')!;
    this.apiVersion = '2024-02-15-preview';
  }

  async generatePromo(prompt: string): Promise<string> {
    try {
      const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;

      const response = await axios.post<{
        choices: { message: { content: string } }[];
      }>(
        url,
        {
          messages: [
            {
              role: 'system',
              content: `Eres un influencer virtual creado con inteligencia artificial. Hablas como una figura pública carismática, moderna y creativa. 
Usas frases virales, emojis y lenguaje directo. Siempre te expresas en primera persona y con mucha personalidad. No actúas como asesor ni consultor, sino como el protagonista de la campaña. 
Responde como si fueras una celebridad digital que habla a sus seguidores y promociona productos, ideas o estilos de vida.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.9,
          max_tokens: 400,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error(
        '❌ Error al generar la promoción con Azure OpenAI:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'No se pudo generar la promoción en este momento.',
      );
    }
  }
}
