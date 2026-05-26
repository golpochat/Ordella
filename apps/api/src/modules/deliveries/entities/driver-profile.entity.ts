import { Column, Entity, Index, OneToMany } from 'typeorm';
import { DriverProfileStatus } from '../enums/driver-profile-status.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { DeliveryAssignmentEntity } from './delivery-assignment.entity';

/** ERD §1.6 drivers — API Spec §7.4 `/drivers` */
@Entity('driver_profiles')
@Index(['tenantId', 'status'])
export class DriverProfileEntity extends BaseTenantScopedEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  phone!: string;

  @Column({ type: 'varchar', length: 32, default: DriverProfileStatus.ACTIVE })
  status!: DriverProfileStatus;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'vehicle_type', type: 'varchar', length: 32, nullable: true })
  vehicleType!: string | null;

  @Column({ name: 'last_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLat!: string | null;

  @Column({ name: 'last_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLng!: string | null;

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  @OneToMany(() => DeliveryAssignmentEntity, (assignment) => assignment.driverProfile)
  assignments!: DeliveryAssignmentEntity[];
}
