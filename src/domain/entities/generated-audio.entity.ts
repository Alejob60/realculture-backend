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
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.generatedAudios)
  @JoinColumn({ name: 'user_id' }) // Llave foránea explícita
  user: UserEntity;

  @Column()
  audioUrl: string;

  @Column({ nullable: true })
  prompt: string;

  @CreateDateColumn()
  createdAt: Date;
}
