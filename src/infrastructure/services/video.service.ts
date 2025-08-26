import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { exec } from 'child_process';
import { GenerateVideoDto } from '../../interfaces/dto/video-generation.dto';

const execPromise = util.promisify(exec);

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  private readonly blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING!,
  );

  private readonly accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
  private readonly accountKey = process.env.AZURE_STORAGE_KEY!;
  private readonly containerVideo = process.env.AZURE_STORAGE_CONTAINER_VIDEO!;
  private readonly containerAudio = process.env.AZURE_STORAGE_CONTAINER_AUDIO!;
  private readonly containerSubtitle = process.env.AZURE_STORAGE_CONTAINER_SUBTITLE!;
  private readonly videoGeneratorUrl = process.env.VIDEO_GENERATOR_URL!;

  /** ------------------- FLUJO PRINCIPAL ------------------- */
  async generateVideo(dto: GenerateVideoDto, userId: string): Promise<{
    videoUrl: string;
    audioUrl?: string | null;
    subtitleUrl?: string | null;
  }> {
    try {
      this.validateEnvVars();

      this.logger.log(`🎬 Iniciando procesamiento de video para usuario: ${userId}`);

      // Garantizar valores booleanos
      const payload = {
        prompt: dto.prompt,
        useVoice: dto.useVoice ?? true,
        useSubtitles: dto.useSubtitles ?? true,
        useMusic: dto.useMusic ?? false,
        useSora: dto.useSora ?? true,
      };

      // 1️⃣ Llamada al microservicio video-generator
      const response = await axios.post(`${this.videoGeneratorUrl}/video/generate`, payload);
      const { videoUrl: tempVideoUrl, audioUrl: tempAudioUrl, subtitleUrl: tempSubtitleUrl } = response.data;

      // 2️⃣ Descargar archivos temporalmente
      const videoPath = await this.downloadFile(tempVideoUrl, 'video.mp4');
      let audioPath: string | null = null;
      let subtitlePath: string | null = null;

      if (payload.useVoice && tempAudioUrl) audioPath = await this.downloadFile(tempAudioUrl, 'voice.mp3');
      if (payload.useSubtitles && tempSubtitleUrl) subtitlePath = await this.downloadFile(tempSubtitleUrl, 'subtitles.srt');

      // 3️⃣ Unir video + audio + subtítulos con FFmpeg si es necesario
      let finalVideoPath = videoPath;
      if (audioPath || subtitlePath) {
        finalVideoPath = await this.mergeWithFFmpeg(videoPath, audioPath, subtitlePath);
      }

      // 4️⃣ Subir a Azure Blob Storage
      const videoBlobUrl = await this.uploadToBlob(finalVideoPath, this.containerVideo);
      const audioBlobUrl = audioPath ? await this.uploadToBlob(audioPath, this.containerAudio) : null;
      const subtitleBlobUrl = subtitlePath ? await this.uploadToBlob(subtitlePath, this.containerSubtitle) : null;

      // 5️⃣ Generar URLs SAS
      const signedVideoUrl = await this.generateSasUrl(this.containerVideo, path.basename(finalVideoPath));
      const signedAudioUrl = audioPath ? await this.generateSasUrl(this.containerAudio, path.basename(audioPath)) : null;
      const signedSubtitleUrl = subtitlePath ? await this.generateSasUrl(this.containerSubtitle, path.basename(subtitlePath)) : null;

      // 6️⃣ Limpiar archivos temporales
      this.cleanTempFiles([videoPath, audioPath, subtitlePath, finalVideoPath]);

      return { videoUrl: signedVideoUrl, audioUrl: signedAudioUrl, subtitleUrl: signedSubtitleUrl };
    } catch (error: any) {
      this.logger.error(`❌ Error en generateVideo: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error al generar el video: ${error.message}`);
    }
  }

  /** ------------------- MÉTODOS PRIVADOS ------------------- */

  private validateEnvVars() {
    const requiredVars = [
      'AZURE_STORAGE_CONNECTION_STRING',
      'AZURE_STORAGE_ACCOUNT_NAME',
      'AZURE_STORAGE_KEY',
      'AZURE_STORAGE_CONTAINER_VIDEO',
      'AZURE_STORAGE_CONTAINER_AUDIO',
      'AZURE_STORAGE_CONTAINER_SUBTITLE',
      'VIDEO_GENERATOR_URL',
    ];
    for (const v of requiredVars) {
      if (!process.env[v]) throw new Error(`Variable de entorno faltante: ${v}`);
    }
  }

  private async downloadFile(fileUrl: string, fileName: string): Promise<string> {
    const tmpDir = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const filePath = path.join(tmpDir, fileName);
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);
    return filePath;
  }

  private async mergeWithFFmpeg(videoPath: string, audioPath: string | null, subtitlePath: string | null): Promise<string> {
    const outputPath = path.join(__dirname, '../../tmp', 'final-video.mp4');
    let cmd = `ffmpeg -i "${videoPath}"`;
    if (audioPath) cmd += ` -i "${audioPath}" -c:v copy -c:a aac`;
    if (subtitlePath) cmd += ` -vf subtitles="${subtitlePath}"`;
    cmd += ` "${outputPath}"`;
    await execPromise(cmd);
    return outputPath;
  }

  private async uploadToBlob(localPath: string, containerName: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blobName = path.basename(localPath);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadFile(localPath);
    return blockBlobClient.url;
  }

  private async generateSasUrl(containerName: string, blobName: string): Promise<string> {
    const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    const sasToken = generateBlobSASQueryParameters(
      { containerName, blobName, permissions: BlobSASPermissions.parse('r'), expiresOn: new Date(Date.now() + 3600 * 1000) },
      sharedKeyCredential,
    ).toString();
    return `https://${this.accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
  }

  private cleanTempFiles(paths: (string | null)[]) {
    for (const p of paths) if (p && fs.existsSync(p)) fs.unlinkSync(p);
  }
}
