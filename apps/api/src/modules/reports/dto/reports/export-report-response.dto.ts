import { ReportJobStatus } from '../../enums/report-job-status.enum';

export class ExportReportResponseDto {
  jobId!: string;
  status!: ReportJobStatus;
  fileUrl!: string | null;
  reportType!: string;
  format!: string;
  rowCount!: number;
}
