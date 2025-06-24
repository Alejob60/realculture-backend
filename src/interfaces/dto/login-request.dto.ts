// src/interfaces/dto/login-request.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}
