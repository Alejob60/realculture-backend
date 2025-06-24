import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('generated_audios')
export class GeneratedAudioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.generatedAudios)
  user: UserEntity;

  @Column()
  audioUrl: string;

  @Column({ nullable: true })
  prompt: string;

  @CreateDateColumn()
  createdAt: Date;
}
