import { ReportExportFormat } from '../../enums/report-export-format.enum';
import { ReportJobStatus } from '../../enums/report-job-status.enum';

export class ReportJobResponseDto {
  id!: string;
  tenantId!: string;
  reportId!: string | null;
  definitionId!: string | null;
  reportType!: string | null;
  format!: ReportExportFormat;
  status!: ReportJobStatus;
  fileUrl!: string | null;
  parameters!: Record<string, unknown>;
  locationId!: string | null;
  requestedBy!: string | null;
  startedAt!: Date | null;
  completedAt!: Date | null;
  errorMessage!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
