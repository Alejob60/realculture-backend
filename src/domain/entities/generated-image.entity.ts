// src/domain/entities/generated-image.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('generated_images')
export class GeneratedImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  prompt: string; // ✅ Este es el prompt mejorado, no el original

  @Column({ nullable: true })
  imageUrl: string; // ✅ Renombrado desde `url` para mayor claridad

  @Column({ nullable: true }) // 🔥 Esto evita el error al sincronizar
  filename: string;

  @Column({ default: 'active' }) // ✅ Puede ser: 'active', 'expired'
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // ✅ Fecha de expiración basada en el plan del usuario

  @ManyToOne(() => UserEntity, (user) => user.generatedImages)
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;
}
