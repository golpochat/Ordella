import { IntegrationProviderCategory } from '../../enums/integration-provider-category.enum';

export class IntegrationProviderResponseDto {
  id!: string;
  slug!: string;
  name!: string;
  category!: IntegrationProviderCategory;
  authType!: string;
  capabilities!: string[];
  docsUrl!: string | null;
  configSchema!: Record<string, unknown>;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date | null;
}
