import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true, name: 'media_url' })
  mediaUrl?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number; // en segundos (opcional para audio/video)

  @Column({ default: 'other' })
  type: 'image' | 'audio' | 'video' | 'text' | 'other';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.contents, { nullable: true, eager: true })
  @JoinColumn({ name: 'creator_id' })
  creator?: UserEntity;

  @Column({ nullable: true, name: 'creator_id' })
  creatorId?: string;

  @Column({ default: 'completed' })
  status: string;
}
