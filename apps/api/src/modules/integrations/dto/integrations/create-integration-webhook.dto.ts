import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

/** API Spec §13.1–§13.3 — inbound partner webhook payload */
export class CreateIntegrationWebhookDto {
  @IsUUID()
  integrationId!: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
