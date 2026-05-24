import { ReportDefinitionEntity } from './report-definition.entity';
import { ReportJobEntity } from './report-job.entity';
import { ReportResultEntity } from './report-result.entity';
import { ReportEntity } from './report.entity';

export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { ReportDefinitionEntity } from './report-definition.entity';
export { ReportJobEntity } from './report-job.entity';
export { ReportResultEntity } from './report-result.entity';
export { ReportEntity } from './report.entity';

export const REPORTS_ENTITIES = [
  ReportDefinitionEntity,
  ReportJobEntity,
  ReportResultEntity,
  ReportEntity,
];
