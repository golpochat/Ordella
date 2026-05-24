import { Column, Entity, Index } from 'typeorm';
import { ReportDefinitionSlug } from '../enums/report-definition-slug.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';

/** SRS §14 — report type catalog */
@Entity('report_definitions')
@Index(['slug'], { unique: true })
export class ReportDefinitionEntity extends BaseTimestampsEntity {
  @Column({ type: 'varchar', length: 64, unique: true })
  slug!: ReportDefinitionSlug;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'parameters_schema', type: 'jsonb', default: {} })
  parametersSchema!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
