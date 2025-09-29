import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('merged_media')
export class MergedMediaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  projectId: string | null;

  @Column({ type: 'varchar' })
  finalMediaUrl: string;

  @Column({ type: 'varchar', nullable: true })
  videoId: string | null;

  @Column({ type: 'varchar', nullable: true })
  audioId: string | null;

  @Column({ type: 'varchar', nullable: true })
  subtitleId: string | null;

  @Column({ type: 'varchar', nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  audioUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  subtitleUrl: string | null;

  @Column({ type: 'varchar' })
  status: string; // 'processing', 'completed', 'failed'

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'integer', nullable: true })
  duration: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}