import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { IntegrationStatus } from '../../enums/integration-status.enum';

export class UpdateIntegrationDto {
  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  syncSchedule?: string;

  @IsOptional()
  @IsString()
  conflictResolution?: string;
}
