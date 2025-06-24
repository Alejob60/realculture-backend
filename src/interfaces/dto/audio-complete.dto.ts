import { IsString, IsNumber } from 'class-validator';

export class AudioCompleteDto {
  @IsString()
  userId: string;

  @IsString()
  prompt: string;

  @IsString()
  audioUrl: string;

  @IsNumber()
  duration: number;
}
