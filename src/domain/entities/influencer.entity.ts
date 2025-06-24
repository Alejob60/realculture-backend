import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('influencers')
export class InfluencerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  personality: string;

  @Column()
  style: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @OneToMany(() => Product, (product) => product.influencer)
  products: Product[];
  @Column({ default: 'USER' })
  type: 'OFFICIAL' | 'USER';

  @Column({ nullable: true })
  demoVideoUrl: string;

  @Column({ type: 'json', nullable: true })
  stats: { engagement: number };
}
