import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpException,
} from '@nestjs/common';
import { AuthService } from '../../infrastructure/services/auth.service';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { JwtAuthGuard } from '../../interfaces/guards/jwt-auth.guard';
import { UserService } from 'src/infrastructure/services/user.service';
import { LoginUseCase } from 'src/application/use-cases/login.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() loginDto: LoginRequestDto) {
    console.log('🟡 Intentando login con:', loginDto.email);
    return this.loginUseCase.execute(loginDto);
  }

  @Post('google-login')
  async loginWithGoogle(@Body() body: { token: string }) {
    return this.authService.loginWithGoogle(body.token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: { user: { userId: string } }) {
    const user = await this.userService.findById(req.user.userId);
    if (!user) {
      throw new HttpException('Usuario no encontrado', 404);
    }
    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.role,
      credits: user.credits,
      picture: null,
    };
  }
}
