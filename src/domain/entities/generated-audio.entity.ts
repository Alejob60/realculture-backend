import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('generated_audios')
export class GeneratedAudioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  audioUrl: string;

  @Column({ nullable: true })
  prompt: string;

  @CreateDateColumn()
  createdAt: Date;

  // FK hacia UserEntity, que tiene el id del usuario
  @ManyToOne(() => UserEntity, (user) => user.generatedAudios)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}