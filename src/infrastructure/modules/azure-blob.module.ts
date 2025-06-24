// src/infrastructure/modules/azure-blob.module.ts
import { Module } from '@nestjs/common';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.services';

@Module({
  providers: [AzureBlobService],
  exports: [AzureBlobService],
})
export class AzureBlobModule {}
