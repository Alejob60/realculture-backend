/* import { Injectable, Logger } from '@nestjs/common';
import { AzureBusService } from '../../infrastructure/services/azure-bus.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.services';
import { AiService } from '../../infrastructure/services/ai.service';
import { GenerateStorybookDto } from '../../interfaces/dto/generate-storybook.dto';

interface JobPayload extends GenerateStorybookDto {
  jobId: string;
}

@Injectable()
export class StorybookWorker {
  private readonly logger = new Logger(StorybookWorker.name);
  private readonly storybookQueue = 'storybook-jobs';
  private readonly storybookContainer = 'storybook';

  constructor(
    private readonly azureBusService: AzureBusService,
    private readonly azureBlobService: AzureBlobService,
    private readonly aiService: AiService,
  ) {
    this.listenForJobs();
  }

  private listenForJobs() {
    this.logger.log(`Listening for jobs on queue: ${this.storybookQueue}`);
    this.azureBusService.subscribe(this.storybookQueue, this.processJob.bind(this));
  }

  private async processJob(payload: JobPayload): Promise<void> {
    const { jobId, idea, nPages, language } = payload;
    this.logger.log(`Processing storybook job ${jobId}`);

    try {
      await this.updateStatus(jobId, 'processing');

      const storyParts = await this.generateStory(idea, nPages, language);
      const pages = await this.generatePages(jobId, storyParts, language);

      const result = {
        jobId,
        status: 'completed',
        title: idea,
        createdAt: new Date().toISOString(),
        pages,
      };

      await this.azureBlobService.uploadFile({
        container: this.storybookContainer,
        filename: `${jobId}/result.json`,
        file: Buffer.from(JSON.stringify(result)),
        contentType: 'application/json',
      });

      await this.updateStatus(jobId, 'completed');
      this.logger.log(`Job ${jobId} completed successfully.`);
    } catch (error) {
      this.logger.error(`Job ${jobId} failed`, error.stack);
      await this.updateStatus(jobId, 'failed', error.message);
    }
  }

  private async updateStatus(jobId: string, status: string, error?: string): Promise<void> {
    const statusObject: any = { status, jobId, updatedAt: new Date().toISOString() };
    if (error) {
      statusObject.error = error;
    }
    await this.azureBlobService.uploadFile({
      container: this.storybookContainer,
      filename: `${jobId}/status.json`,
      file: Buffer.from(JSON.stringify(statusObject)),
      contentType: 'application/json',
    });
  }

  private async generateStory(idea: string, nPages: number, language: string): Promise<string[]> {
    this.logger.log(`Generating story for idea: "${idea}"`);
    const prompt = `Create a children's story based on the idea: "${idea}". The story should be divided into exactly ${nPages} parts. Each part should be a short paragraph. The story should be in ${language}. Return the parts separated by '|||'.`;
    const storyText = await this.aiService.generateText(prompt);
    return storyText.split('|||').map(part => part.trim());
  }

  private async generatePages(jobId: string, storyParts: string[], language: string): Promise<any[]> {
    const pagePromises = storyParts.map(async (text, index) => {
      const pageNumber = index + 1;
      this.logger.log(`Generating page ${pageNumber} for job ${jobId}`);

      const imagePrompt = await this.generateImagePrompt(text, language);
      const imageBuffer = await this.aiService.generateImage(imagePrompt);
      
      const imageName = `page${pageNumber}.png`;
      const imagePath = `${jobId}/${imageName}`;

      await this.azureBlobService.uploadFile({
        container: this.storybookContainer,
        filename: imagePath,
        file: imageBuffer,
        contentType: 'image/png',
      });

      const imageUrl = await this.azureBlobService.getSignedUrl({
        container: this.storybookContainer,
        filename: imagePath,
        permissions: 'r',
        expiresInSeconds: 86400, // 24 hours
      });

      return {
        pageNumber,
        text,
        imageUrl,
        prompt: imagePrompt,
      };
    });

    return Promise.all(pagePromises);
  }

  private async generateImagePrompt(text: string, language: string): Promise<string> {
    const prompt = `Create a DALL-E 3 prompt for a children's storybook illustration. The illustration should be colorful, cheerful, and in a cartoon style. The scene should depict: "${text}". The prompt should be in English.`;
    return this.aiService.generateText(prompt);
  }
}
 */