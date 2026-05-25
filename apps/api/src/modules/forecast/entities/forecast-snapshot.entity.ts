import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type ForecastType = 'demand' | 'inventory' | 'staffing' | 'delivery_capacity' | 'warehouse_replenishment' | 'summary';

@Entity('forecast_snapshots')
@Index(['tenantId', 'forecastType', 'generatedForDate'])
@Index(['tenantId', 'forecastType', 'cacheKey'])
export class ForecastSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'forecast_type', type: 'varchar', length: 64 })
  forecastType!: ForecastType;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ name: 'horizon_days', type: 'int', default: 7 })
  horizonDays!: number;

  @Column({ name: 'cache_key', type: 'varchar', length: 512 })
  cacheKey!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ name: 'generated_for_date', type: 'date' })
  generatedForDate!: string;

  @Column({ name: 'confidence', type: 'decimal', precision: 6, scale: 4, nullable: true })
  confidence!: string | null;

  @CreateDateColumn({ name: 'generated_at', type: 'timestamptz' })
  generatedAt!: Date;
}
