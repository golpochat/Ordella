import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ReportExportFormat } from '../enums/report-export-format.enum';
import { ReportJobStatus } from '../enums/report-job-status.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { ReportEntity } from './report.entity';
import { ReportResultEntity } from './report-result.entity';

/** SRS §14 — async export / scheduled report jobs */
@Entity('report_jobs')
@Index(['tenantId', 'status'])
@Index(['reportId', 'createdAt'])
export class ReportJobEntity extends BaseTenantScopedEntity {
  @Column({ name: 'report_id', type: 'uuid', nullable: true })
  reportId!: string | null;

  @ManyToOne(() => ReportEntity, (report) => report.jobs, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'report_id' })
  report!: ReportEntity | null;

  @Column({ name: 'definition_id', type: 'uuid' })
  definitionId!: string;

  @Column({ type: 'varchar', length: 16 })
  format!: ReportExportFormat;

  @Column({ type: 'varchar', length: 32, default: ReportJobStatus.QUEUED })
  status!: ReportJobStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @OneToMany(() => ReportResultEntity, (result) => result.job)
  results!: ReportResultEntity[];
}
