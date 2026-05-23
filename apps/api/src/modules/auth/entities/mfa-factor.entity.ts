import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { MfaMethod } from '../enums/mfa-method.enum';
import { BaseTenantEntity } from './base-tenant.entity';
import { UserEntity } from './user.entity';

/** MFA enrollment — API Spec POST /auth/mfa/verify. */
@Entity('mfa_factors')
@Index(['userId', 'method'], { unique: true })
export class MfaFactorEntity extends BaseTenantEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.mfaFactors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar', length: 32 })
  method!: MfaMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secret!: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;
}
