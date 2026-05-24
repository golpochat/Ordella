import { ReportJobStatus } from '../../enums/report-job-status.enum';

export class ExportReportResponseDto {
  jobId!: string;
  status!: ReportJobStatus;
}
