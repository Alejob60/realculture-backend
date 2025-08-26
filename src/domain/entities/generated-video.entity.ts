import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export type VideoJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

@Entity('generated_videos')
export class GeneratedVideoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  jobId: string;

  @ManyToOne(() => UserEntity, (user) => user.generatedVideos)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'QUEUED',
  })
  status: VideoJobStatus;

  @Column({ type: 'jsonb' })
  prompt: object;

  @Column({ type: 'text', nullable: true })
  script: string | null;

  @Column({ type: 'varchar', nullable: true })
  fileName: string | null;

  @Column({ type: 'varchar', nullable: true })
  soraJobId: string | null;

  @Column({ type: 'varchar', nullable: true })
  generationId: string | null;

  @Column({ type: 'varchar', nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  audioUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  subtitlesUrl: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;
}