import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AzureBlobService {
  private readonly logger = new Logger(AzureBlobService.name);
  private readonly containerName =
    process.env.AZURE_STORAGE_CONTAINER_IMAGES || process.env.AZURE_BLOB_CONTAINER || 'images';
  private readonly account = process.env.AZURE_STORAGE_ACCOUNT!;
  private readonly accountKey = process.env.AZURE_STORAGE_KEY!;
  private readonly sharedKeyCredential: StorageSharedKeyCredential;
  private readonly blobServiceClient: BlobServiceClient;

  constructor() {
    this.sharedKeyCredential = new StorageSharedKeyCredential(
      this.account,
      this.accountKey,
    );
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.account}.blob.core.windows.net`,
      this.sharedKeyCredential,
    );
  }

  /**
   * Sube un archivo desde el sistema de archivos local al contenedor de Azure Blob.
   * Retorna la URL pública (sin firma).
   */
  async uploadToContainer(
    filePath: string,
    subfolder: string = '',
  ): Promise<string> {
    const fileName = path.basename(filePath);
    const blobName = subfolder ? `${subfolder}/${fileName}` : fileName;

    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const fileBuffer = fs.readFileSync(filePath);

    await blockBlobClient.upload(fileBuffer, fileBuffer.length);
    const blobUrl = blockBlobClient.url;

    this.logger.log(`📤 Archivo subido a Azure Blob Storage: ${blobUrl}`);
    return blobUrl;
  }

  /**
   * Devuelve una URL firmada SAS para el archivo especificado, válida por X segundos.
   */
  async getSignedUrl(
    filename: string,
    expiresInSeconds = 86400,
  ): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient = containerClient.getBlobClient(filename);

    const expiresOn = new Date(Date.now() + expiresInSeconds * 1000);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: filename,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn,
        protocol: SASProtocol.Https,
      },
      this.sharedKeyCredential,
    ).toString();

    const signedUrl = `${blobClient.url}?${sasToken}`;
    this.logger.log(`🔐 URL firmada generada: ${signedUrl}`);
    return signedUrl;
  }
  public getContainerClient(containerName?: string) {
    return this.blobServiceClient.getContainerClient(containerName || this.containerName);
  }
  
  async checkIfBlobExists(blobName: string, container?: string): Promise<boolean> {
    try {
      const client = this.getContainerClient(container);
      const blobClient = client.getBlobClient(blobName);
      const exists = await blobClient.exists();
      return exists;
    } catch (error) {
      this.logger.error(`❌ Error verificando existencia de blob ${blobName}`, error);
      return false;
    }
  }
  /**
   * Sube un buffer a un contenedor y blob específicos.
   */
  async uploadBufferToContainer(
    buffer: Buffer,
    blobName: string,
    containerName: string,
    contentType?: string,
  ): Promise<string> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    this.logger.log(`📤 Buffer subido a ${containerName}/${blobName}`);
    return blockBlobClient.url;
  }

  /**
   * Devuelve una URL firmada SAS para un blob en un contenedor específico.
   */
  async getSignedUrlForContainer(
    containerName: string,
    blobName: string,
    expiresInSeconds = 86400,
  ): Promise<string> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const expiresOn = new Date(Date.now() + expiresInSeconds * 1000);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn,
        protocol: SASProtocol.Https,
      },
      this.sharedKeyCredential,
    ).toString();

    const signedUrl = `${blobClient.url}?${sasToken}`;
    this.logger.log(`🔐 URL firmada generada para ${containerName}/${blobName}`);
    return signedUrl;
  }

  /**
   * Elimina un archivo del contenedor de Azure.
   */
  async deleteBlob(filename: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient = containerClient.getBlobClient(filename);

    const exists = await blobClient.exists();
    if (exists) {
      await blobClient.delete();
      this.logger.log(`🗑️ Blob eliminado: ${filename}`);
    } else {
      this.logger.warn(`⚠️ Blob no encontrado para eliminar: ${filename}`);
    }
  }

  /**
   * Verifica si un blob existe en un contenedor específico
   */
  async blobExists(containerName: string, blobName: string): Promise<boolean> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      return await blobClient.exists();
    } catch (error) {
      this.logger.error(`❌ Error verificando existencia de blob ${containerName}/${blobName}`, error);
      return false;
    }
  }

  /**
   * Sube un texto (ej: SRT) a un blob
   */
  async uploadText(blobName: string, content: string, containerName?: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName || this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(content, Buffer.byteLength(content), {
      blobHTTPHeaders: { blobContentType: 'text/plain' },
    });
    this.logger.log(`📤 Texto subido a ${containerName || this.containerName}/${blobName}`);
  }
}
