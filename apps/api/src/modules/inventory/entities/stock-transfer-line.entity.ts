import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../catalog/entities';
import { StockItemEntity } from './stock-item.entity';
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

  @ManyToOne(() => StockItemEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'stock_item_id' })
  stockItem!: StockItemEntity;

  @Column({ name: 'item_id', type: 'uuid', nullable: true })
  itemId!: string | null;

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'item_id' })
  item!: ProductEntity | null;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  quantity!: string;

  @Column({ name: 'quantity_requested', type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantityRequested!: string;

  @Column({ name: 'quantity_sent', type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantitySent!: string;

  @Column({ name: 'quantity_received', type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantityReceived!: string;
}
