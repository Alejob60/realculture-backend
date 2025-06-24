import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { UserEntity } from '../../domain/entities/user.entity';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ nullable: true })
  duration?: number; // en segundos (opcional para audio/video)

  @Column({ default: 'other' })
  type: 'image' | 'audio' | 'video' | 'text' | 'other';

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.contents)
  creator?: UserEntity;

  @Column({ nullable: true })
  userId?: string; // para relaciones sin instanciar entidad completa

  @Column({ default: 'completed' })
  status: string;
}
