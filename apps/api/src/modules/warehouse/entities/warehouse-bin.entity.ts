import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WarehouseBinItemEntity } from './warehouse-bin-item.entity';
import { WarehouseZoneEntity } from './warehouse-zone.entity';

@Entity('warehouse_bins')
@Index(['zoneId', 'code'], { unique: true })
export class WarehouseBinEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'zone_id', type: 'uuid' })
  zoneId!: string;

  @ManyToOne(() => WarehouseZoneEntity, (zone) => zone.bins, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone!: WarehouseZoneEntity;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => WarehouseBinItemEntity, (item) => item.bin)
  contents!: WarehouseBinItemEntity[];
}
