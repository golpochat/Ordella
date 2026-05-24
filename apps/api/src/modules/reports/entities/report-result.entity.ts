import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReportExportFormat } from '../enums/report-export-format.enum';
import { ReportJobEntity } from './report-job.entity';

/** Generated report output metadata */
@Entity('report_results')
@Index(['jobId'])
export class ReportResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId!: string;

  @ManyToOne(() => ReportJobEntity, (job) => job.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: ReportJobEntity;

  @Column({ type: 'varchar', length: 16 })
  format!: ReportExportFormat;

  @Column({ name: 'storage_ref', type: 'varchar', length: 512, nullable: true })
  storageRef!: string | null;

  @Column({ type: 'jsonb', default: {} })
  summary!: Record<string, unknown>;

  @Column({ name: 'row_count', type: 'int', nullable: true })
  rowCount!: number | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
