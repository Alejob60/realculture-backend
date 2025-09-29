import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('generated_music')
export class GeneratedMusicEntity {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.generatedMusic)
  @JoinColumn({ name: 'user_id' }) // Define explícitamente la FK en la BD
  user: UserEntity;

  @Column()
  musicUrl: string;

  @Column({ nullable: true })
  prompt: string;

  @CreateDateColumn()
  createdAt: Date;
}
