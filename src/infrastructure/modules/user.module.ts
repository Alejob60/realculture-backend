
import { Module, forwardRef } from '@nestjs/common';
import { UserController } from '../../interfaces/controllers/user.controller';
import { UserService } from '../services/user.service';
import { DatabaseModule } from '../database/database.module';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { AuthModule } from '../../auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, LoginUseCase],
  exports: [UserService],
})
export class UserModule {}
