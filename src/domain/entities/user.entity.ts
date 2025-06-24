import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Content } from './content.entity';
import { GeneratedImageEntity } from './generated-image.entity';
import { UserRole } from '../enums/user-role.enum';
import { GeneratedVideoEntity } from './generated-video.entity';
import { GeneratedAudioEntity } from './generated-audio.entity';
import { GeneratedMusicEntity } from './generated-music.entity';
// src/domain/entities/user.entity.ts
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.FREE })
  role: UserRole;

  @Column({ default: 'FREE' }) // ✅ Nuevo: campo 'plan'
  plan: string;

  @Column({ nullable: true }) // ✅ Nuevo: campo 'picture' (avatar opcional)
  picture?: string;

  @Column({ type: 'int', default: 25 })
  credits: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Content, (content) => content.creator)
  contents: Content[];

  @OneToMany(() => GeneratedImageEntity, (image) => image.user)
  generatedImages: GeneratedImageEntity[];

  @OneToMany(() => GeneratedVideoEntity, (video) => video.user)
  generatedVideos: GeneratedVideoEntity[];

  @OneToMany(() => GeneratedAudioEntity, (audio) => audio.user)
  generatedAudios: GeneratedAudioEntity[];

  @OneToMany(() => GeneratedMusicEntity, (music) => music.user)
  generatedMusic: GeneratedMusicEntity[];
}
