import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

import { UserRepository } from '../database/user.repository';
import { LoginRequestDto } from '../../interfaces/dto/login-request.dto';
import { RegisterRequestDto } from '../../interfaces/dto/register-request.dto';
import { AuthResponseDto } from '../../interfaces/dto/auth-response.dto';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async getTokens(user: UserEntity) {
    this.logger.log(`Generating tokens for user: ${user.email}`);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.userId,
          email: user.email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    this.logger.log(`Updating refresh token for user: ${userId}`);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(userId, {
      hashedRefreshToken,
    });
  }

  async validateUserAndGenerateToken(
    body: LoginRequestDto,
  ): Promise<AuthResponseDto> {
    this.logger.log(`Validating user: ${body.email}`);
    const user = await this.userRepo.findByEmail(body.email);
    if (!user) {
      this.logger.warn(`User not found: ${body.email}`);
      throw new UnauthorizedException('Correo no registrado');
    }

    if (!user.password) {
      this.logger.warn(`User ${body.email} must login with Google`);
      throw new UnauthorizedException(
        'Este usuario debe iniciar sesión con Google',
      );
    }

    const passwordMatches = await bcrypt.compare(body.password, user.password);
    if (!passwordMatches) {
      this.logger.warn(`Incorrect password for user: ${body.email}`);
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.userId, tokens.refreshToken);

    this.logger.log(`User ${body.email} logged in successfully`);
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user.userId,
      email: user.email,
      name: user.name ?? 'Usuario sin nombre',
      role: user.role,
      credits: user.credits,
    };
  }

  async register(body: RegisterRequestDto): Promise<AuthResponseDto> {
    this.logger.log(`Registering new user: ${body.email}`);
    const existing = await this.userRepo.findByEmail(body.email);
    if (existing) {
      this.logger.warn(`Email already registered: ${body.email}`);
      throw new ConflictException('Este correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const newUser = await this.userRepo.save({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: UserRole.CREATOR,
      credits: 100,
    });

    const tokens = await this.getTokens(newUser);
    await this.updateRefreshToken(newUser.userId, tokens.refreshToken);

    this.logger.log(`User ${body.email} registered successfully`);
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: newUser.userId,
      email: newUser.email,
      name: newUser.name ?? 'Usuario sin nombre',
      role: newUser.role,
      credits: newUser.credits,
    };
  }

  async loginWithGoogle(idToken: string): Promise<AuthResponseDto> {
    this.logger.log('Attempting Google login');
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const email = payload?.email;
      const name = payload?.name ?? 'Usuario RealCulture';
      const googleId = payload?.sub;

      if (!email) {
        this.logger.error('Email not available in Google token');
        throw new UnauthorizedException(
          'Correo no disponible en token de Google',
        );
      }

      let user = await this.userRepo.findByEmail(email);

      if (!user) {
        this.logger.log(`Creating new user from Google login: ${email}`);
        user = await this.userRepo.save({
          email,
          name,
          googleId,
          role: UserRole.FREE,
          credits: 100,
        });
      }

      const tokens = await this.getTokens(user);
      await this.updateRefreshToken(user.userId, tokens.refreshToken);

      this.logger.log(`User ${email} logged in successfully with Google`);
      return {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userId: user.userId,
        email: user.email,
        name: user.name ?? 'Usuario sin nombre',
        role: user.role,
        credits: user.credits,
      };
    } catch (error) {
      this.logger.error('[Google Login Error]', error.stack);
      throw new UnauthorizedException('Token de Google inválido');
    }
  }

  async logout(userId: string) {
    this.logger.log(`Logging out user: ${userId}`);
    return this.userRepo.update(userId, { hashedRefreshToken: undefined });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    this.logger.log(`Refreshing tokens for user: ${userId}`);
    const user = await this.userRepo.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      this.logger.warn(`Access denied for refresh token for user: ${userId}`);
      throw new ForbiddenException('Acceso denegado');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      this.logger.warn(`Incorrect refresh token for user: ${userId}`);
      throw new ForbiddenException('Acceso denegado');
    }

    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.userId, tokens.refreshToken);

    this.logger.log(`Tokens refreshed successfully for user: ${userId}`);
    return tokens;
  }
}

