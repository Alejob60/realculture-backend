import { IsOptional, IsString } from 'class-validator';

export class GeneratePromoImageDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  textOverlay?: string;
}
