import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ModifierEntity } from './modifier.entity';

/** ERD §1.2 — modifier_options */
@Entity('modifier_options')
@Index(['modifierId', 'name'])
export class ModifierOptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'modifier_id', type: 'uuid' })
  modifierId!: string;

  @ManyToOne(() => ModifierEntity, (modifier) => modifier.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modifier_id' })
  modifier!: ModifierEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'price_delta', type: 'decimal', precision: 12, scale: 2, default: 0 })
  priceDelta!: string;
}
