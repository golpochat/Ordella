import { IntegrationStatus } from '../../enums/integration-status.enum';
import { IntegrationProviderCategory } from '../../enums/integration-provider-category.enum';

export class IntegrationAppResponseDto {
  id!: string;
  tenantId!: string;
  providerId!: string;
  providerSlug!: string;
  providerName!: string;
  providerCategory!: IntegrationProviderCategory;
  name!: string;
  status!: IntegrationStatus;
  config!: Record<string, unknown>;
  connectedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
