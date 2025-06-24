import { IsString, IsIn, IsOptional } from 'class-validator';

export class GenerateAudioDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsIn(['20s', '30s', '60s'])
  duration?: string;
}
