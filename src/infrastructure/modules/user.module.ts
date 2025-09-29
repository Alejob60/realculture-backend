import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserController } from '../../interfaces/controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../database/user.repository';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { AuthModule } from '../../auth.module';
import { UseServiceUseCase } from '../../application/use-cases/use-service.use-case';
import { MediaModule } from './media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => AuthModule),
    MediaModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, LoginUseCase, UseServiceUseCase],
  exports: [UserService, UserRepository, UseServiceUseCase],
})
export class UserModule {}
