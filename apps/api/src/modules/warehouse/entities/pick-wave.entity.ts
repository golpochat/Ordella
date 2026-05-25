import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../auth/entities';
import { LocationEntity } from '../../tenants/entities';

export type PickWaveStatus = 'pending' | 'picking' | 'completed';

@Entity('pick_waves')
@Index(['tenantId', 'locationId', 'status'])
export class PickWaveEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @ManyToOne(() => LocationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location!: LocationEntity;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: PickWaveStatus;

  @Column({ name: 'picker_id', type: 'uuid', nullable: true })
  pickerId!: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'picker_id' })
  picker!: UserEntity | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
