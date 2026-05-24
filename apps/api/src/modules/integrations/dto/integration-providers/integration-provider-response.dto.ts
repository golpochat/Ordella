import { IntegrationProviderCategory } from '../../enums/integration-provider-category.enum';

export class IntegrationProviderResponseDto {
  id!: string;
  slug!: string;
  name!: string;
  category!: IntegrationProviderCategory;
  configSchema!: Record<string, unknown>;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date | null;
}
