import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../database/user.repository';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

// Mock de bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUserAndGenerateToken', () => {
    it('should return tokens for a valid user', async () => {
      const user: UserEntity = {
        userId: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: UserRole.FREE,
        credits: 100,
        createdAt: new Date(),
        contents: [],
        generatedImages: [],
        generatedVideos: [],
        generatedAudios: [],
        generatedMusic: [],
        plan: 'FREE',
      };

      const loginDto = { email: 'test@example.com', password: 'password' };

      mockUserRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('test-token');

      const result = await authService.validateUserAndGenerateToken(loginDto);

      expect(result.token).toBe('test-token');
      expect(result.refreshToken).toBe('test-token');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const user: UserEntity = {
        userId: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: UserRole.FREE,
        credits: 100,
        createdAt: new Date(),
        contents: [],
        generatedImages: [],
        generatedVideos: [],
        generatedAudios: [],
        generatedMusic: [],
        plan: 'FREE',
      };

      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };

      mockUserRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.validateUserAndGenerateToken(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
