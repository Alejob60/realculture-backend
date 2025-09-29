import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  prompt: string;

  @Column({ nullable: true, name: 'media_url' })
  mediaUrl: string;

  @Column({ default: 'success' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt: Date;

  @Column({ nullable: true })
  filename: string;

  @Column({ type: 'float', nullable: true })
  duration: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ nullable: true, name: 'audio_url' })
  audioUrl: string;

  @Column({ type: 'float', nullable: true, name: 'audio_duration' })
  audioDuration: number;

  @Column({ nullable: true, name: 'audio_voice' })
  audioVoice: string;

  @ManyToOne(() => UserEntity, (user) => user.contents, { nullable: true, eager: true })
  @JoinColumn({ name: 'creatorUserId', referencedColumnName: 'userId' })
  creator: UserEntity;

  // Add userId property to access the foreign key value directly
  @Column({ nullable: true, name: 'creatorUserId' })
  userId: string;

  // Make updated_at column optional since it doesn't exist in the database
  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}