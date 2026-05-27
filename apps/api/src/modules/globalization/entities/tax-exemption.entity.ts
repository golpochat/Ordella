import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tax_exemptions')
@Index(['tenantId', 'countryCode', 'exemptionType'])
export class TaxExemptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode!: string;

  @Column({ name: 'region_code', type: 'varchar', length: 64, nullable: true })
  regionCode!: string | null;

  @Column({ name: 'exemption_type', type: 'varchar', length: 32 })
  exemptionType!: 'b2b' | 'wholesale' | 'export' | 'nonprofit';

  @Column({ name: 'tax_id', type: 'varchar', length: 64, nullable: true })
  taxId!: string | null;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
