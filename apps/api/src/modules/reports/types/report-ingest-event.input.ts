import { ReportEventType } from '../enums/report-event-type.enum';

export interface ReportIngestEventInput {
  tenantId: string;
  eventType: ReportEventType;
  payload: Record<string, unknown>;
  occurredAt?: Date;
}

export interface ReportDateRange {
  from: string;
  to: string;
}
