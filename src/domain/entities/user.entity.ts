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

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'name', nullable: true })
  name?: string;

  @Column({ name: 'password', nullable: true })
  password?: string;

  @Column({ name: 'google_id', nullable: true })
  googleId?: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.FREE })
  role: UserRole;

  @Column({ name: 'plan', default: 'FREE' })
  plan: string;

  @Column({ name: 'avatar', nullable: true })
  picture?: string;

  @Column({ name: 'credits', type: 'int', default: 25 })
  credits: number;

  @CreateDateColumn({ name: 'created_at' })
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
