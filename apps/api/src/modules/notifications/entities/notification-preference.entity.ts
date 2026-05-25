import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';

@Entity('notification_preferences')
@Index(['tenantId', 'userId'], { unique: true })
export class NotificationPreferenceEntity extends BaseTenantScopedEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'email_enabled', type: 'boolean', default: true })
  emailEnabled!: boolean;

  @Column({ name: 'sms_enabled', type: 'boolean', default: false })
  smsEnabled!: boolean;

  @Column({ name: 'push_enabled', type: 'boolean', default: true })
  pushEnabled!: boolean;

  @Column({ type: 'jsonb', default: [] })
  categories!: string[];
}
