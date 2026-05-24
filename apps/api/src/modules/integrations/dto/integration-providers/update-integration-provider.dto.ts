import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class UpdateIntegrationProviderDto {
  @IsOptional()
  @IsObject()
  configSchema?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
