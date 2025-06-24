import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { InfluencerEntity } from './influencer.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => InfluencerEntity, (influencer) => influencer.products, {
    nullable: true,
  })
  influencer: InfluencerEntity;
}
