import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

import { UserRepository } from '../database/user.repository';
import { LoginRequestDto } from '../../interfaces/dto/login-request.dto';
import { RegisterRequestDto } from '../../interfaces/dto/register-request.dto';
import { AuthResponseDto } from '../../interfaces/dto/auth-response.dto';
import { UserRole } from 'src/domain/enums/user-role.enum';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async validateUserAndGenerateToken(
    body: LoginRequestDto,
  ): Promise<AuthResponseDto> {
    const user = await this.userRepo.findByEmail(body.email);
    if (!user) {
      throw new UnauthorizedException('Correo no registrado');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Este usuario debe iniciar sesión con Google',
      );
    }

    const passwordMatches = await bcrypt.compare(body.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const token = this.jwtService.sign({
      sub: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      token,
      userId: user.userId,
      email: user.email,
      name: user.name ?? 'Usuario sin nombre',
      role: user.role,
      credits: user.credits,
    };
  }

  async register(body: RegisterRequestDto): Promise<AuthResponseDto> {
    const existing = await this.userRepo.findByEmail(body.email);
    if (existing) {
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

    const token = this.jwtService.sign({
      sub: newUser.userId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return {
      token,
      userId: newUser.userId,
      email: newUser.email,
      name: newUser.name ?? 'Usuario sin nombre',
      role: newUser.role,
      credits: newUser.credits,
    };
  }

  async loginWithGoogle(idToken: string): Promise<AuthResponseDto> {
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
        throw new UnauthorizedException(
          'Correo no disponible en token de Google',
        );
      }

      let user = await this.userRepo.findByEmail(email);

      if (!user) {
        user = await this.userRepo.save({
          email,
          name,
          googleId,
          role: UserRole.FREE,
          credits: 100,
        });
      }

      const token = this.jwtService.sign({
        sub: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return {
        token,
        userId: user.userId,
        email: user.email,
        name: user.name ?? 'Usuario sin nombre',
        role: user.role,
        credits: user.credits,
      };
    } catch (error) {
      console.error('[Google Login Error]', error);
      throw new UnauthorizedException('Token de Google inválido');
    }
  }
}
