import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../catalog/entities';
import { WarehouseBinEntity } from './warehouse-bin.entity';

@Entity('warehouse_bin_items')
@Index(['binId', 'itemId'], { unique: true })
export class WarehouseBinItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'bin_id', type: 'uuid' })
  binId!: string;

  @ManyToOne(() => WarehouseBinEntity, (bin) => bin.contents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bin_id' })
  bin!: WarehouseBinEntity;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: ProductEntity;

  @Column({ type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantity!: string;
}
