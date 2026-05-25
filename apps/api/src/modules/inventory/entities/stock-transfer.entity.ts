import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { LocationEntity } from '../../tenants/entities';
import { StockTransferStatus } from '../enums/stock-transfer-status.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { StockTransferLineEntity } from './stock-transfer-line.entity';

/** ERD §1.3 — stock_transfers */
@Entity('stock_transfers')
@Index(['tenantId', 'status'])
export class StockTransferEntity extends BaseTenantScopedEntity {
  @Column({ name: 'from_location_id', type: 'uuid' })
  fromLocationId!: string;

  @Column({ name: 'to_location_id', type: 'uuid' })
  toLocationId!: string;

  @ManyToOne(() => LocationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'from_location_id' })
  fromLocation!: LocationEntity;

  @ManyToOne(() => LocationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'to_location_id' })
  toLocation!: LocationEntity;

  @Column({ type: 'varchar', length: 32, default: StockTransferStatus.DRAFT })
  status!: StockTransferStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'dispatched_at', type: 'timestamptz', nullable: true })
  dispatchedAt!: Date | null;

  @Column({ name: 'received_at', type: 'timestamptz', nullable: true })
  receivedAt!: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

  @OneToMany(() => StockTransferLineEntity, (line) => line.transfer)
  lines!: StockTransferLineEntity[];
}
