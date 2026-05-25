import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LocationEntity } from '../../tenants/entities';
import { OrderEntity } from '../../orders/entities';

@Entity('routing_decisions')
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'toLocationId'])
export class RoutingDecisionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @ManyToOne(() => OrderEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity | null;

  @Column({ name: 'from_location_id', type: 'uuid', nullable: true })
  fromLocationId!: string | null;

  @ManyToOne(() => LocationEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'from_location_id' })
  fromLocation!: LocationEntity | null;

  @Column({ name: 'to_location_id', type: 'uuid', nullable: true })
  toLocationId!: string | null;

  @ManyToOne(() => LocationEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'to_location_id' })
  toLocation!: LocationEntity | null;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ name: 'estimated_delivery_minutes', type: 'int', nullable: true })
  estimatedDeliveryMinutes!: number | null;

  @Column({ name: 'fallback_options', type: 'jsonb', default: () => "'[]'" })
  fallbackOptions!: Array<Record<string, unknown>>;

  @Column({ name: 'input_snapshot', type: 'jsonb', default: () => "'{}'" })
  inputSnapshot!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
