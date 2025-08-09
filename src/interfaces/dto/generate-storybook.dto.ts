import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class GenerateStorybookDto {
  @IsString()
  @IsNotEmpty()
  idea: string;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(20)
  nPages?: number = 10;

  @IsOptional()
  @IsString()
  language?: string = 'es';
}
