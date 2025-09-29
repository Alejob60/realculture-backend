import { IsArray, IsString, IsOptional, IsUUID } from 'class-validator';

export class MergeMediaDto {
  @IsOptional()
  @IsUUID()
  videoId?: string;

  @IsOptional()
  @IsUUID()
  audioId?: string;

  @IsOptional()
  @IsUUID()
  subtitleId?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  subtitleUrl?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}