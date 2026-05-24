import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

/** API Spec §13.4 POST /api/v1/integrations/apps */
export class ConnectIntegrationAppDto {
  @IsUUID()
  providerId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
