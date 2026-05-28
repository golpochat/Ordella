import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('compliance_profiles')
@Index(['tenantId', 'countryCode'], { unique: true })
export class ComplianceProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode!: string;

  @Column({ name: 'invoice_format', type: 'varchar', length: 64, default: 'standard_vat' })
  invoiceFormat!: string;

  @Column({ name: 'privacy_regime', type: 'varchar', length: 64, default: 'gdpr' })
  privacyRegime!: string;

  @Column({ name: 'tax_report_template', type: 'varchar', length: 64, default: 'vat_return' })
  taxReportTemplate!: string;

  @Column({ name: 'invoice_fields', type: 'jsonb', default: () => "'{}'" })
  invoiceFields!: Record<string, unknown>;

  @Column({ name: 'export_config', type: 'jsonb', default: () => "'{}'" })
  exportConfig!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
