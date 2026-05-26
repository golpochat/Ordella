import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TenantEntity } from '../../tenants/entities/tenant.entity';

@Entity('tenant_settings')
export class TenantSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId!: string;

  @OneToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ type: 'varchar', length: 8, default: 'EUR' })
  currency!: string;

  @Column({ name: 'currency_symbol', type: 'varchar', length: 8, default: '€' })
  currencySymbol!: string;

  @Column({ type: 'varchar', length: 16, default: 'en-IE' })
  locale!: string;

  @Column({ type: 'varchar', length: 64, default: 'Europe/Dublin' })
  timezone!: string;

  @Column({ name: 'date_format', type: 'varchar', length: 32, default: 'DD/MM/YYYY' })
  dateFormat!: string;

  @Column({ name: 'number_format', type: 'varchar', length: 32, default: '1,234.56' })
  numberFormat!: string;

  @Column({ type: 'varchar', length: 2, default: 'IE' })
  country!: string;

  @Column({ name: 'default_tax_rate', type: 'numeric', precision: 7, scale: 4, default: 0 })
  defaultTaxRate!: string;

  @Column({ name: 'opening_hours', type: 'jsonb', default: {} })
  openingHours!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
