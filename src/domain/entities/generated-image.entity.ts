// src/domain/entities/generated-image.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('generated_images')
export class GeneratedImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;  // PK propia y única del GeneratedImage

  @Column()
  prompt: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  filename: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  // FK hacia UserEntity, que tiene el id del usuario
  @ManyToOne(() => UserEntity, (user) => user.generatedImages)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;
}
