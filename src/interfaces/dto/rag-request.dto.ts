import { IsString, MinLength } from 'class-validator';

export class RagRequestDto {
  @IsString()
  @MinLength(5)
  prompt: string;
}
