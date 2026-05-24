import { ReportStatus } from '../../enums/report-status.enum';
import { ReportDefinitionSlug } from '../../enums/report-definition-slug.enum';

export class ReportResponseDto {
  id!: string;
  tenantId!: string;
  definitionId!: string;
  definitionSlug!: ReportDefinitionSlug;
  name!: string | null;
  parameters!: Record<string, unknown>;
  status!: ReportStatus;
  locationId!: string | null;
  requestedBy!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
