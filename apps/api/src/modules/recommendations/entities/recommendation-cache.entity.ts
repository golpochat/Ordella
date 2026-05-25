import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('recommendation_cache')
export class RecommendationCacheEntity {
  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @PrimaryColumn({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @Column({ name: 'recommendations', type: 'uuid', array: true, default: () => "'{}'" })
  recommendations!: string[];

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
