import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('generated_videos')
export class GeneratedVideoEntity {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.generatedVideos)
  @JoinColumn({ name: 'user_id' }) // este será el nombre de la columna en la BD
  user: UserEntity;

  @Column()
  videoUrl: string;

  @Column({ nullable: true })
  prompt: string;

  @CreateDateColumn()
  createdAt: Date;
}
