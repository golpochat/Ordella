import { IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';
import { ReportDefinitionSlug } from '../../enums/report-definition-slug.enum';
import { ReportExportFormat } from '../../enums/report-export-format.enum';

/** API Spec §12.5 POST /api/v1/reports/export */
export class ExportReportDto {
  @IsEnum(ReportDefinitionSlug)
  reportType!: ReportDefinitionSlug;

  @IsEnum(ReportExportFormat)
  format!: ReportExportFormat;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  locationId?: string;
}
