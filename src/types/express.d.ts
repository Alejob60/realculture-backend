// src/types/express.d.ts

import { UserEntity } from '../../domain/entities/user.entity';

// Extiende la interfaz Request del namespace Express
declare global {
  namespace Express {
    export interface Request {
      // Añade la propiedad 'user' a la interfaz Request
      user?: UserEntity;
    }
  }
}