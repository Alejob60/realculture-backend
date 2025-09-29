import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { InfluencerEntity } from './influencer.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Index() // Mejora rendimiento en búsquedas por influencer
  @Column({ nullable: true })
  influencerId?: string;

  @ManyToOne(() => InfluencerEntity, (influencer) => influencer.products, {
    nullable: true,
    onDelete: 'SET NULL', // Evita cascada no deseada
  })
  @JoinColumn({ name: 'influencerId' })
  influencer?: InfluencerEntity;
}
