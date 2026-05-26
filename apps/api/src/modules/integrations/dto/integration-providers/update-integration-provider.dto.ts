import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { IntegrationProviderCategory } from '../../enums/integration-provider-category.enum';

export class UpdateIntegrationProviderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(IntegrationProviderCategory)
  category?: IntegrationProviderCategory;

  @IsOptional()
  @IsString()
  authType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];

  @IsOptional()
  @IsString()
  docsUrl?: string;

  @IsOptional()
  @IsObject()
  configSchema?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
