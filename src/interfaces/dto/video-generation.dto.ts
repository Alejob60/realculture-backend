import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsObject, IsNumber } from 'class-validator';

export class GenerateVideoDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsObject()
  @IsOptional()
  jsonPrompt?: any;

  @IsString()
  @IsOptional()
  plan?: string;

  @IsBoolean()
  @IsOptional()
  useVoice?: boolean;

  @IsBoolean()
  @IsOptional()
  useSubtitles?: boolean;

  @IsBoolean()
  @IsOptional()
  useMusic?: boolean;

  @IsBoolean()
  @IsOptional()
  useSora?: boolean;

  @IsNumber()
  @IsOptional()
  n_seconds?: number;

  constructor(partial?: Partial<GenerateVideoDto>) {
    Object.assign(this, partial);

    // Defaults
    if (this.plan === undefined) this.plan = 'free';
    if (this.useVoice === undefined) this.useVoice = true;
    if (this.useSubtitles === undefined) this.useSubtitles = true;
    if (this.useMusic === undefined) this.useMusic = false;
    if (this.useSora === undefined) this.useSora = true;
  }
}