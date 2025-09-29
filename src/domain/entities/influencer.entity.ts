import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

export enum InfluencerType {
  OFFICIAL = 'OFFICIAL',
  USER = 'USER',
}

@Entity('influencers')
export class InfluencerEntity {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  name: string;

  @Column()
  personality: string;

  @Column()
  style: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Product, (product) => product.influencer)
  products: Product[];

  @Column({ type: 'enum', enum: InfluencerType, default: InfluencerType.USER })
  type: InfluencerType;

  @Column({ nullable: true })
  demoVideoUrl?: string;

  @Column({ type: 'json', nullable: true })
  stats?: { engagement: number };
}
