import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampsEntity } from '../../loyalty/entities/base-timestamps.entity';
import { BundleEntity } from './bundle.entity';

@Entity('bundle_items')
@Index(['bundleId'])
export class BundleItemEntity extends BaseTimestampsEntity {
  @Column({ name: 'bundle_id', type: 'uuid' })
  bundleId!: string;

  @ManyToOne(() => BundleEntity, (bundle) => bundle.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bundle_id' })
  bundle!: BundleEntity;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ name: 'is_optional', type: 'boolean', default: false })
  isOptional!: boolean;

  @Column({ name: 'min_select', type: 'int', nullable: true })
  minSelect!: number | null;

  @Column({ name: 'max_select', type: 'int', nullable: true })
  maxSelect!: number | null;
}
