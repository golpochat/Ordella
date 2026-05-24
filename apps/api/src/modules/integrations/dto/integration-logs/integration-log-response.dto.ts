import { IntegrationLogLevel } from '../../enums/integration-log-level.enum';

export class IntegrationLogResponseDto {
  id!: string;
  tenantId!: string;
  integrationId!: string;
  level!: IntegrationLogLevel;
  action!: string;
  message!: string | null;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
}
