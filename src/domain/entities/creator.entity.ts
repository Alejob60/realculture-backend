// src/domain/entities/creator.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Content } from './content.entity';

@Entity('creators')
export class Creator {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  name: string;

  @Column()
  bio: string;

  @Column()
  avatarUrl: string;

  @OneToMany(() => Content, (content) => content.creator)
  contents: Content[];
}
