import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StockTransferEntity } from './stock-transfer.entity';

@Entity('stock_transfer_lines')
export class StockTransferLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'transfer_id', type: 'uuid' })
  transferId!: string;

  @ManyToOne(() => StockTransferEntity, (transfer) => transfer.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transfer_id' })
  transfer!: StockTransferEntity;

  @Column({ name: 'stock_item_id', type: 'uuid' })
  stockItemId!: string;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  quantity!: string;
}
