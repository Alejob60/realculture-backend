// src/types/express.d.ts
import { UserEntity } from '../domain/entities/user.entity';

declare module 'express' {
  export interface Request {
    user?: UserEntity;
  }
}
