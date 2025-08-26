import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string; // ✅ Cambié userId por id (porque esto es el ID del contenido, no del usuario)

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true, name: 'media_url' })
  mediaUrl?: string; // URL pública del archivo (opcional)

  @Column({ nullable: true, name: 'blob_path' })
  blobPath?: string; // ✅ Ruta interna en Azure Blob Storage (p.ej., "user-123/video1.mp4")

  @Column({ type: 'int', nullable: true })
  duration?: number; // En segundos (para audio/video)

  @Column({ default: 'other' })
  type: 'image' | 'audio' | 'video' | 'text' | 'other';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.contents, { nullable: true, eager: true })
  @JoinColumn({ name: 'creator_id' })
  creator?: UserEntity;

  @Column({ nullable: true, name: 'creator_id' })
  creatorId?: string;

  @Column({ default: 'completed' })
  status: string;
}
