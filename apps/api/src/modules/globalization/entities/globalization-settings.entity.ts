import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('globalization_settings')
@Index(['tenantId'], { unique: true })
export class GlobalizationSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'base_currency', type: 'varchar', length: 8, default: 'EUR' })
  baseCurrency!: string;

  @Column({ name: 'default_locale', type: 'varchar', length: 16, default: 'en-IE' })
  defaultLocale!: string;

  @Column({ name: 'supported_countries', type: 'text', array: true, default: () => "'{IE,GB,US}'" })
  supportedCountries!: string[];

  @Column({ name: 'supported_currencies', type: 'text', array: true, default: () => "'{EUR,GBP,USD}'" })
  supportedCurrencies!: string[];

  @Column({ name: 'dual_pricing_enabled', type: 'boolean', default: false })
  dualPricingEnabled!: boolean;

  @Column({ name: 'rounding_mode', type: 'varchar', length: 32, default: 'half_up' })
  roundingMode!: 'half_up' | 'bankers' | 'cash';

  @Column({ name: 'cash_rounding_increment', type: 'decimal', precision: 6, scale: 4, default: '0.05' })
  cashRoundingIncrement!: string;

  @Column({ name: 'fx_provider', type: 'varchar', length: 64, default: 'ordella-fx-fallback' })
  fxProvider!: string;

  @Column({ name: 'reporting_currency', type: 'varchar', length: 8, default: 'EUR' })
  reportingCurrency!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
