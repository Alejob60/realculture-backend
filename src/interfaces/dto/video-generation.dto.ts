import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class GenerateVideoDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

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
