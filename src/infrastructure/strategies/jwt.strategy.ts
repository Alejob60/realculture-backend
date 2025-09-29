// src/infrastructure/strategies/jwt.strategy.ts
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    
    this.logger.log(`JWT Strategy initialized with secret: ${configService.get<string>('JWT_SECRET') ? 'SECRET_SET' : 'SECRET_NOT_SET'}`);
  }

  async validate(payload: {
    sub: string;
    email: string;
    name: string;
    role: string;
  }) {
    this.logger.log(`JWT payload validated: ${JSON.stringify(payload)}`);
    
    return {
      id: payload.sub, // ← Use 'id' to match RequestWithUser interface
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }
}