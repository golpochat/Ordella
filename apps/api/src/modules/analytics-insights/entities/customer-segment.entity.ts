import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('customer_segments')
@Index(['tenantId', 'name'], { unique: true })
export class CustomerSegmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  rules!: Record<string, unknown>;

  @Column({ name: 'customer_ids', type: 'uuid', array: true, default: () => "'{}'" })
  customerIds!: string[];

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metrics!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
