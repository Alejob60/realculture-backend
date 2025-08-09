import { Module, forwardRef } from '@nestjs/common';
import { UserController } from '../../interfaces/controllers/user.controller';
import { UserService } from '../services/user.service';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { AuthModule } from '../../auth.module';
import { UseServiceUseCase } from 'src/application/use-cases/use-service.use-case';
import { DatabaseModule } from '../database/database.module';
import { MediaModule } from './media.module';  // <-- Importa MediaModule

@Module({
  imports: [
    DatabaseModule, 
    forwardRef(() => AuthModule),
    forwardRef(() => MediaModule), // <-- Agrega MediaModule aquí con forwardRef
  ],
  controllers: [UserController],
  providers: [UserService, LoginUseCase, UseServiceUseCase],
  exports: [UserService, UseServiceUseCase],
})
export class UserModule {}
