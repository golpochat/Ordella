import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type RoutingRuleType = 'distance' | 'stock' | 'capacity' | 'priority' | 'delivery_zone';

@Entity('routing_rules')
@Index(['tenantId', 'ruleType'])
export class RoutingRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'rule_type', type: 'varchar', length: 32 })
  ruleType!: RoutingRuleType;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  value!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
