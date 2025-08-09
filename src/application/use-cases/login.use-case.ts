import { Injectable } from '@nestjs/common';
import { AuthService } from '../../infrastructure/services/auth.service';
import { LoginRequestDto } from '../../interfaces/dto/login-request.dto';
import { AuthResponseDto } from '../../interfaces/dto/auth-response.dto';

@Injectable()
export class LoginUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(loginRequestDto: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.validateUserAndGenerateToken(loginRequestDto);
  }
}