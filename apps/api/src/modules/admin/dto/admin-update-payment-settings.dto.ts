import { IsObject, IsUUID } from 'class-validator';

export class AdminUpdatePaymentSettingsDto {
  @IsUUID()
  locationId!: string;

  @IsObject()
  settings!: Record<string, unknown>;
}
