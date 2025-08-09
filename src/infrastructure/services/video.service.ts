// src/infrastructure/services/video.service.ts

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

interface GenerateVideoParams {
  userId: string;
  prompt: string;
  n_seconds: number;
  useVoice: boolean;
  useSubtitles: boolean;
  useMusic: boolean;
  useSora: boolean;
}

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  // Variables de entorno para Azure Sora y Blob Storage
  private soraUrl = process.env.AZURE_SORA_URL;
  private soraApiKey = process.env.AZURE_SORA_API_KEY;
  private soraApiVersion = process.env.AZURE_SORA_API_VERSION || '1.0';

  private blobAccount = process.env.AZURE_BLOB_ACCOUNT_NAME;
  private blobKey = process.env.AZURE_BLOB_ACCOUNT_KEY;
  private blobContainer = process.env.AZURE_BLOB_CONTAINER || 'videos';

  private blobServiceClient: BlobServiceClient;

  constructor() {
    if (!this.soraUrl || !this.soraApiKey) {
      this.logger.error('Faltan configuraciones para Azure Sora');
      throw new Error('Configuración de Azure Sora incompleta');
    }

    if (!this.blobAccount || !this.blobKey) {
      this.logger.error('Faltan configuraciones para Azure Blob Storage');
      throw new Error('Configuración de Azure Blob Storage incompleta');
    }

    const credential = new StorageSharedKeyCredential(this.blobAccount, this.blobKey);
    const blobUrl = `https://${this.blobAccount}.blob.core.windows.net`;
    this.blobServiceClient = new BlobServiceClient(blobUrl, credential);
  }

  async generateFullVideo(params: GenerateVideoParams): Promise<any> {
    this.logger.log(`Iniciando generación de video para usuario ${params.userId}`);

    // 1. Crear job en Azure Sora
    const jobPayload = {
      prompt: params.prompt,
      n_seconds: params.n_seconds,
      useVoice: params.useVoice,
      useSubtitles: params.useSubtitles,
      useMusic: params.useMusic,
      useSora: params.useSora,
    };

    let jobId: string;

    try {
      const createResponse = await fetch(`${this.soraUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.soraApiKey,
          'api-version': this.soraApiVersion,
        },
        body: JSON.stringify(jobPayload),
      });

      if (!createResponse.ok) {
        const errText = await createResponse.text();
        this.logger.error(`Error creando job en Sora: ${errText}`);
        throw new HttpException('Error creando job en Sora', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const createData = await createResponse.json();
      jobId = createData.jobId;
      this.logger.log(`Job creado con ID: ${jobId}`);
    } catch (error) {
      this.logger.error('Error en llamada a Sora:', error);
      throw error;
    }

    // 2. Esperar hasta que el job esté completado (polling)
    let jobStatus = 'pending';
    let resultData: any = null;

    while (jobStatus === 'pending' || jobStatus === 'processing') {
      await new Promise((r) => setTimeout(r, 5000)); // Esperar 5 segundos

      try {
        const statusResponse = await fetch(`${this.soraUrl}/status/${jobId}`, {
          headers: {
            'api-key': this.soraApiKey,
            'api-version': this.soraApiVersion,
          },
        });

        if (!statusResponse.ok) {
          const errText = await statusResponse.text();
          this.logger.error(`Error obteniendo status del job: ${errText}`);
          throw new HttpException('Error obteniendo estado del job', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const statusData = await statusResponse.json();
        jobStatus = statusData.status;

        this.logger.log(`Estado del job ${jobId}: ${jobStatus}`);

        if (jobStatus === 'failed') {
          this.logger.error(`Job ${jobId} falló en procesamiento`);
          throw new HttpException('La generación del video falló', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (jobStatus === 'completed') {
          resultData = statusData.result;
          break;
        }
      } catch (error) {
        this.logger.error('Error en polling de job:', error);
        throw error;
      }
    }

    if (!resultData) {
      throw new HttpException('No se obtuvo resultado del job', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 3. Descargar video (puedes guardar localmente o subir directamente a Blob)
    // Aquí asumimos que resultData tiene un campo 'videoUrl' con el link para descarga
    const videoUrl = resultData.videoUrl;
    if (!videoUrl) {
      this.logger.error('No se recibió URL de video en resultado');
      throw new HttpException('Resultado no contiene URL de video', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Descargar el video y subirlo a Blob Storage
    const videoBuffer = await this.downloadFile(videoUrl);
    const blobName = `videos/${params.userId}/video_${Date.now()}.mp4`;

    const uploadedUrl = await this.uploadToBlob(blobName, videoBuffer, 'video/mp4');

    // Aquí podrías también generar y subir voz (TTS) y subtítulos si usas esos flags

    // 4. Retornar la info para backend principal
    return {
      videoUrl: uploadedUrl,
      prompt: params.prompt,
      // otros datos útiles: duración, subtítulos, voz, etc.
    };
  }

  private async downloadFile(url: string): Promise<Buffer> {
    this.logger.log(`Descargando archivo desde URL: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Error descargando archivo: ${errText}`);
      throw new HttpException('Error descargando archivo', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const buffer = await response.buffer();
    return buffer;
  }

  private async uploadToBlob(blobName: string, data: Buffer, contentType: string): Promise<string> {
    this.logger.log(`Subiendo archivo a Blob Storage: ${blobName}`);

    const containerClient = this.blobServiceClient.getContainerClient(this.blobContainer);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    const sasUrl = await this.generateSasUrl(blobName);
    this.logger.log(`Archivo subido y accesible en: ${sasUrl}`);

    return sasUrl;
  }

  private async generateSasUrl(blobName: string): Promise<string> {
    // Aquí implementa la generación de SAS si es necesario,
    // o devuelve URL pública si el contenedor es público

    // Para simplificar, devolver URL pública (ajusta según seguridad)
    return `https://${this.blobAccount}.blob.core.windows.net/${this.blobContainer}/${blobName}`;
  }
}
