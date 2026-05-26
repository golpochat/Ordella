import { IntegrationLogLevel } from '../../enums/integration-log-level.enum';

export class IntegrationLogResponseDto {
  id!: string;
  tenantId!: string;
  integrationId!: string;
  level!: IntegrationLogLevel;
  action!: string;
  message!: string | null;
  metadata!: Record<string, unknown>;
  requestPayload!: Record<string, unknown> | null;
  responsePayload!: Record<string, unknown> | null;
  errorCode!: string | null;
  durationMs!: number | null;
  createdAt!: Date;
}
