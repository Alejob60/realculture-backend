import { Logger } from '@nestjs/common';
import { AzureBlobService } from '../infrastructure/services/azure-blob.services';

/**
 * Espera asincrónicamente hasta que un blob esté disponible en Azure, con reintentos y logs.
 * @returns true si el blob está disponible antes de agotar intentos, false si no
 */
export async function waitForBlobAvailable(
  azureBlobService: AzureBlobService,
  containerName: string,
  blobName: string,
  maxAttempts = 20,
  intervalMs = 1000,
  logger?: Logger
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const exists = await azureBlobService.blobExists(containerName, blobName);
    logger?.log(`[waitForBlobAvailable] Intento ${attempt}/${maxAttempts}: ${exists ? 'OK' : 'no disponible'} para blob ${blobName}`);
    if (exists) return true;
    await new Promise(res => setTimeout(res, intervalMs));
  }
  logger?.error(`[waitForBlobAvailable] El blob ${blobName} no estuvo disponible tras ${maxAttempts} intentos.`);
  return false;
}
