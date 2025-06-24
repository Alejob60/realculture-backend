// src/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entidades y Repositorio
import { UserEntity } from './domain/entities/user.entity';
import { UserRepository } from './infrastructure/database/user.repository';

// Servicios y Estrategias
import { AuthService } from './infrastructure/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Controladores
import { AuthController } from './interfaces/controllers/auth.controller';
import { UserService } from './infrastructure/services/user.service';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([UserEntity]), // Asegúrate que sea UserEntity
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy, UserService],
  exports: [
    AuthService,
    JwtModule, // Exporta JwtModule si necesitas usarlo en otros módulos

    JwtStrategy, // Exporta JwtStrategy si es necesario
    UserService, // Exporta UserService si es necesario
    PassportModule, // Exporta PassportModule si es necesario
  ],
})
export class AuthModule {}
