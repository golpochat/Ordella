import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ReportStatus } from '../enums/report-status.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { ReportDefinitionEntity } from './report-definition.entity';
import { ReportJobEntity } from './report-job.entity';

/** Tenant report run / saved report instance */
@Entity('reports')
@Index(['tenantId', 'definitionId'])
@Index(['tenantId', 'status'])
export class ReportEntity extends BaseTenantScopedEntity {
  @Column({ name: 'definition_id', type: 'uuid' })
  definitionId!: string;

  @ManyToOne(() => ReportDefinitionEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'definition_id' })
  definition!: ReportDefinitionEntity;

  @Column({ type: 'varchar', length: 128, nullable: true })
  name!: string | null;

  @Column({ type: 'jsonb', default: {} })
  parameters!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 32, default: ReportStatus.PENDING })
  status!: ReportStatus;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ name: 'requested_by', type: 'uuid', nullable: true })
  requestedBy!: string | null;

  @OneToMany(() => ReportJobEntity, (job) => job.report)
  jobs!: ReportJobEntity[];
}
