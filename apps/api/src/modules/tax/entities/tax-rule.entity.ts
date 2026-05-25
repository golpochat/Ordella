import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type TaxType = 'vat' | 'gst' | 'sales_tax';
export type TaxAppliesTo = 'items' | 'categories' | 'delivery' | 'service_fee';
export type TaxPriceMode = 'inclusive' | 'exclusive';

@Entity('tax_rules')
@Index(['tenantId', 'country', 'region'])
@Index(['tenantId', 'locationId'])
export class TaxRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ type: 'varchar', length: 2 })
  country!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  region!: string | null;

  @Column({ name: 'tax_name', type: 'varchar', length: 128 })
  taxName!: string;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 8, scale: 4 })
  taxRate!: string;

  @Column({ name: 'tax_type', type: 'varchar', length: 32 })
  taxType!: TaxType;

  @Column({ name: 'applies_to', type: 'text', array: true, default: () => "'{items}'" })
  appliesTo!: TaxAppliesTo[];

  @Column({ name: 'price_mode', type: 'varchar', length: 32, default: 'exclusive' })
  priceMode!: TaxPriceMode;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ name: 'rounding_mode', type: 'varchar', length: 32, default: 'half_up' })
  roundingMode!: 'half_up' | 'down' | 'up';

  @Column({ name: 'decimal_places', type: 'int', default: 2 })
  decimalPlaces!: number;

  @Column({ name: 'tax_id_label', type: 'varchar', length: 64, nullable: true })
  taxIdLabel!: string | null;

  @Column({ name: 'tax_id_value', type: 'varchar', length: 128, nullable: true })
  taxIdValue!: string | null;

  @Column({ name: 'invoice_fields', type: 'jsonb', default: () => "'{}'" })
  invoiceFields!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
