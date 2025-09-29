import { Module } from '@nestjs/common';
import { AzureBlobService } from '../services/azure-blob.services';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AzureBlobService],
  exports: [AzureBlobService],
})
export class AzureBlobModule {}