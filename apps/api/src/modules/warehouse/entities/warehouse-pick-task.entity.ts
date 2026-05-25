import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../auth/entities';
import { OrderEntity } from '../../orders/entities';
import { LocationEntity } from '../../tenants/entities';
import { StockTransferEntity } from '../../inventory/entities';

export type WarehousePickTaskStatus = 'pending' | 'picking' | 'completed';

@Entity('warehouse_pick_tasks')
@Index(['warehouseId', 'status'])
export class WarehousePickTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId!: string;

  @ManyToOne(() => LocationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: LocationEntity;

  @Column({ name: 'transfer_id', type: 'uuid', nullable: true })
  transferId!: string | null;

  @ManyToOne(() => StockTransferEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'transfer_id' })
  transfer!: StockTransferEntity | null;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @ManyToOne(() => OrderEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity | null;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: WarehousePickTaskStatus;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo!: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee!: UserEntity | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
