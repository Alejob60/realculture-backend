import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../../infrastructure/services/auth.service';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { JwtAuthGuard } from '../../interfaces/guards/jwt-auth.guard';
import { UserService } from 'src/infrastructure/services/user.service';
import { LoginUseCase } from 'src/application/use-cases/login.use-case';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Conflict. Email already exists.' })
  async register(@Body() body: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginRequestDto) {
    console.log('🟡 Intentando login con:', loginDto.email);
    return this.loginUseCase.execute(loginDto);
  }

  @Post('google-login')
  @ApiOperation({ summary: 'Log in a user with Google' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async loginWithGoogle(@Body() body: { token: string }) {
    return this.authService.loginWithGoogle(body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Log out a user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'The user has been successfully logged out.' })
  async logout(@Req() req: { user: { userId: string } }) {
    await this.authService.logout(req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Logout successful',
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'The tokens have been successfully refreshed.', type: AuthResponseDto })
  async refreshTokens(@Req() req: { user: { sub: string; refreshToken: string } }) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'The user profile.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
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
