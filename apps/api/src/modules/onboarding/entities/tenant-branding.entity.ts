import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TenantEntity } from '../../tenants/entities/tenant.entity';

@Entity('tenant_branding')
export class TenantBrandingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId!: string;

  @OneToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'jsonb', default: {} })
  theme!: Record<string, unknown>;

  @Column({ name: 'business_info', type: 'jsonb', default: {} })
  businessInfo!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
