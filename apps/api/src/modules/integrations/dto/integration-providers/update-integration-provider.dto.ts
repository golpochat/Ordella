import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { IntegrationProviderCategory } from '../../enums/integration-provider-category.enum';

export class UpdateIntegrationProviderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(IntegrationProviderCategory)
  category?: IntegrationProviderCategory;

  @IsOptional()
  @IsObject()
  configSchema?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
