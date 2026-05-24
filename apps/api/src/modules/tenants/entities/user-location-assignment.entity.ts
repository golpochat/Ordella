import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { LocationEntity } from './location.entity';

@Entity('user_location_assignments')
@Index(['tenantId', 'locationId'])
@Index(['userId', 'locationId'], { unique: true })
export class UserLocationAssignmentEntity extends BaseTenantScopedEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @ManyToOne(() => LocationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location!: LocationEntity;
}
