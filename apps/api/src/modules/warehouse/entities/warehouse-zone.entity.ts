import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LocationEntity } from '../../tenants/entities';
import { WarehouseBinEntity } from './warehouse-bin.entity';

export type WarehouseZoneType = 'picking' | 'storage' | 'receiving';

@Entity('warehouse_zones')
@Index(['warehouseId', 'name'], { unique: true })
export class WarehouseZoneEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId!: string;

  @ManyToOne(() => LocationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: LocationEntity;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: WarehouseZoneType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => WarehouseBinEntity, (bin) => bin.zone)
  bins!: WarehouseBinEntity[];
}
