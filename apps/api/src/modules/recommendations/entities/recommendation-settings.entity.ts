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

  @Column({
    name: 'enabled_types',
    type: 'jsonb',
    default: () => `'["trending","frequently_bought_together","recently_viewed","similar_products","category_based"]'`,
  })
  enabledTypes!: string[];

  @Column({
    name: 'ranking_weights',
    type: 'jsonb',
    default: () => `'{"trending":1,"frequentlyBoughtTogether":1,"recentlyViewed":1,"similarProducts":1,"categoryBased":1,"availability":1}'`,
  })
  rankingWeights!: Record<string, number>;

  @Column({ name: 'personalization_rules', type: 'jsonb', default: () => "'{}'" })
  personalizationRules!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
