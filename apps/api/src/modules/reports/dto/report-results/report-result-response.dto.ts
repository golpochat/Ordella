import { ReportExportFormat } from '../../enums/report-export-format.enum';

export class ReportResultResponseDto {
  id!: string;
  jobId!: string;
  format!: ReportExportFormat;
  storageRef!: string | null;
  summary!: Record<string, unknown>;
  rowCount!: number | null;
  expiresAt!: Date | null;
  createdAt!: Date;
}
