import { Column, Entity, Index, OneToMany } from 'typeorm';
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

  @Column({ type: 'varchar', length: 32, default: StockTransferStatus.PENDING })
  status!: StockTransferStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @OneToMany(() => StockTransferLineEntity, (line) => line.transfer)
  lines!: StockTransferLineEntity[];
}
