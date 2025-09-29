import { IsArray, IsString, IsOptional, IsUrl, IsUUID } from 'class-validator';

export class MediaItemDto {
  @IsString()
  type: 'video' | 'audio' | 'subtitle';

  @IsOptional()
  @IsUrl()
  sasUrl?: string;

  @IsOptional()
  @IsString()
  uploadedFileId?: string;

  @IsOptional()
  @IsUUID()
  existingMediaId?: string;
}

export class ValidateMediaDto {
  @IsArray()
  mediaItems: MediaItemDto[];

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}