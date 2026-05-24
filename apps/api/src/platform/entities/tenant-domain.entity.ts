import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantEntity } from '../../modules/tenants/entities/tenant.entity';

export enum TenantDomainType {
  CUSTOM = 'custom',
  SUBDOMAIN = 'subdomain',
  APEX = 'apex',
}

@Entity('tenant_domains')
@Index(['tenantId'])
export class TenantDomainEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ type: 'varchar', length: 255, unique: true })
  domain!: string;

  @Column({ name: 'domain_type', type: 'varchar', length: 32, default: TenantDomainType.CUSTOM })
  domainType!: TenantDomainType;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
