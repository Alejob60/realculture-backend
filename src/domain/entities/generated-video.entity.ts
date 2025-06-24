// src/domain/entities/generated-video.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('generated_videos')
export class GeneratedVideoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.generatedVideos)
  user: UserEntity;

  @Column()
  videoUrl: string;

  @Column({ nullable: true })
  prompt: string;

  @CreateDateColumn()
  createdAt: Date;
}
