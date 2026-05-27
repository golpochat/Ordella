import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fx_rates')
@Index(['tenantId', 'fromCurrency', 'toCurrency', 'effectiveAt'])
export class FxRateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;

  @Column({ name: 'from_currency', type: 'varchar', length: 8 })
  fromCurrency!: string;

  @Column({ name: 'to_currency', type: 'varchar', length: 8 })
  toCurrency!: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  rate!: string;

  @Column({ type: 'varchar', length: 32, default: 'fallback' })
  source!: 'live' | 'fallback' | 'manual';

  @Column({ name: 'effective_at', type: 'timestamptz' })
  effectiveAt!: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
