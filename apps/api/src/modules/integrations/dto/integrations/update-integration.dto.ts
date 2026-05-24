import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { IntegrationStatus } from '../../enums/integration-status.enum';

export class UpdateIntegrationDto {
  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
