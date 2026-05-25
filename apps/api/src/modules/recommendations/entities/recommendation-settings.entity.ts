import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('recommendation_settings')
export class RecommendationSettingsEntity {
  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled!: boolean;

  @Column({ name: 'personalization_enabled', type: 'boolean', default: true })
  personalizationEnabled!: boolean;

  @Column({ name: 'cart_upsells_enabled', type: 'boolean', default: true })
  cartUpsellsEnabled!: boolean;

  @Column({ name: 'max_recommendations', type: 'int', default: 4 })
  maxRecommendations!: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
