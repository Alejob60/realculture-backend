import { IsString, IsUrl } from 'class-validator';

export class CreateGeneratedImageDto {
  @IsString()
  userId: string;

  @IsString()
  prompt: string;

  @IsUrl()
  imageUrl: string;
}
