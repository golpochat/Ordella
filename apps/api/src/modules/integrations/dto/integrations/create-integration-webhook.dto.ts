import { IsObject, IsOptional } from 'class-validator';

/** API Spec §13.1–§13.3 — inbound partner webhook payload */
export class CreateIntegrationWebhookDto {
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
