import { IntegrationStatus } from '../../enums/integration-status.enum';
import { IntegrationProviderCategory } from '../../enums/integration-provider-category.enum';

export class IntegrationAppResponseDto {
  id!: string;
  tenantId!: string;
  providerId!: string;
  providerSlug!: string;
  providerName!: string;
  providerCategory!: IntegrationProviderCategory;
  integrationType!: string;
  name!: string;
  status!: IntegrationStatus;
  config!: Record<string, unknown>;
  syncSchedule!: string | null;
  conflictResolution!: string;
  retryCount!: number;
  lastSyncAt!: Date | null;
  lastSyncStatus!: string | null;
  connectedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
