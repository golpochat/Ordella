import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type RecommendationEventType = 'view' | 'add_to_cart' | 'purchase' | 'impression' | 'click';

@Entity('recommendation_events')
@Index(['tenantId', 'itemId', 'eventType'])
@Index(['tenantId', 'customerId', 'createdAt'])
export class RecommendationEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 32 })
  eventType!: RecommendationEventType;

  @Column({ name: 'source', type: 'varchar', length: 64, nullable: true })
  source!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
