import { IsOptional, IsString, IsObject, IsBoolean } from 'class-validator';

export class GeneratePromoImageDto {
  @IsString()
  @IsOptional()
  prompt?: string;

  @IsObject()
  @IsOptional()
  jsonPrompt?: any;

  @IsOptional()
  @IsString()
  textOverlay?: string;

  @IsBoolean()
  @IsOptional()
  useFlux?: boolean;

  @IsBoolean()
  @IsOptional()
  dualImageMode?: boolean;
}