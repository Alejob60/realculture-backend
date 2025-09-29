import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Content } from './content.entity';
import { GeneratedImageEntity } from './generated-image.entity';
import { GeneratedVideoEntity } from './generated-video.entity';
import { GeneratedAudioEntity } from './generated-audio.entity';
import { GeneratedMusicEntity } from './generated-music.entity';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'userId' })
  userId: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'name', nullable: true })
  name?: string;

  @Column({ name: 'password', nullable: true })
  password?: string;

  @Column({ name: 'googleId', nullable: true })
  googleId?: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.FREE })
  role: UserRole;

  @Column({ name: 'plan', default: 'FREE' })
  plan: string;

  @Column({ name: 'picture', nullable: true })
  picture?: string;

  @Column({ name: 'credits', type: 'int', default: 25 })
  credits: number;

  @Column({ name: 'hashed_refresh_token', nullable: true })
  hashedRefreshToken?: string;

  @Column({ name: 'resetToken', nullable: true })
  resetToken?: string;

  @Column({ name: 'resetTokenExpires', type: 'timestamp', nullable: true })
  resetTokenExpires?: Date;

  @Column({ name: 'isResetting', type: 'boolean', default: false })
  isResetting: boolean;

  @CreateDateColumn({ name: 'createdAt' })
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
