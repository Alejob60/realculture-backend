import { Module, forwardRef } from '@nestjs/common';
import { AudioController } from '../../interfaces/controllers/audio.controller';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from './user.module';
import { MediaModule } from './media.module';
import { ContentModule } from './content.module';
import { ContentUseCase } from '../../application/use-cases/content.use-case';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => UserModule),
    MediaModule,    // Aquí importa sin forwardRef si no hay ciclo
    ContentModule,
  ],
  controllers: [AudioController],
  providers: [ContentUseCase],
})
export class AudioModule {}
