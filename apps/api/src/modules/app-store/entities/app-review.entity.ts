import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MarketplaceAppEntity } from './marketplace-app.entity';

@Entity('app_reviews')
@Index(['tenantId', 'appId'])
@Index(['appId', 'rating'])
export class AppReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_id', type: 'uuid' })
  appId!: string;

  @ManyToOne(() => MarketplaceAppEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app!: MarketplaceAppEntity;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'published' })
  status!: 'published' | 'hidden' | 'flagged';

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
