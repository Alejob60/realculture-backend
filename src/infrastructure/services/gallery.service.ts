import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Content } from 'src/domain/entities/content.entity';
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);
  private readonly accountName: string;
  private readonly accountKey: string;
  private readonly containerName: string;

  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    private readonly configService: ConfigService,
  ) {
    this.accountName = this.getRequiredConfig('AZURE_STORAGE_ACCOUNT');
    this.accountKey = this.getRequiredConfig('AZURE_STORAGE_KEY');
    this.containerName = this.getRequiredConfig('AZURE_BLOB_CONTAINER');
  }

  /**
   * Obtiene la galería del usuario dentro del periodo de suscripción (últimos 30 días).
   */
  async getUserGallery(userId: string): Promise<
    {
      id: string;
      title: string;
      description: string;
      type: 'image' | 'audio' | 'video' | 'text' | 'other';
      createdAt: Date;
      sasUrl: string | null;
      previewUrl: string | null;
    }[]
  > {
    this.logger.log(`Consultando galería para el usuario: ${userId}`);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);

    const contents = await this.contentRepository.find({
      where: {
        creatorId: userId,
        createdAt: MoreThanOrEqual(dateFrom),
      },
      order: { createdAt: 'DESC' },
    });

    const result: {
      id: string;
      title: string;
      description: string;
      type: 'image' | 'audio' | 'video' | 'text' | 'other';
      createdAt: Date;
      sasUrl: string | null;
      previewUrl: string | null;
    }[] = [];

    for (const item of contents) {
      let sasUrl: string | null = null;
      let previewUrl: string | null = null;

      if (item.blobPath) {
        sasUrl = await this.generateSasUrl(item.blobPath);
        previewUrl = await this.generatePreviewUrl(item.blobPath);
      }

      result.push({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        createdAt: item.createdAt,
        sasUrl,
        previewUrl,
      });
    }

    return result;
  }

  /**
   * Genera SAS URL para un archivo en Azure Blob Storage.
   */
  private async generateSasUrl(blobPath: string): Promise<string> {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    const sas = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: expiryDate,
      },
      new StorageSharedKeyCredential(this.accountName, this.accountKey),
    ).toString();

    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobPath}?${sas}`;
  }

  /**
   * Genera una URL para preview (si existe miniatura).
   */
  private async generatePreviewUrl(blobPath: string): Promise<string> {
    const previewPath = `thumbnails/${blobPath}`;
    // Por simplicidad, asumimos que siempre existe, si quieres validar debes usar SDK de Azure
    return this.generateSasUrl(previewPath);
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      this.logger.error(`Missing required environment variable: ${key}`);
      throw new InternalServerErrorException(
        `Configuration error: Missing ${key}`,
      );
    }
    return value;
  }
}
