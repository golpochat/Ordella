import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { IntegrationProviderCategory } from '../../enums/integration-provider-category.enum';

export class CreateIntegrationProviderDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsEnum(IntegrationProviderCategory)
  category!: IntegrationProviderCategory;

  @IsOptional()
  @IsObject()
  configSchema?: Record<string, unknown>;
}
