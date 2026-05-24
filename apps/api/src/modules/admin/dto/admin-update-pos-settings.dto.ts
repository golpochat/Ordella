import { IsObject, IsUUID } from 'class-validator';

export class AdminUpdatePosSettingsDto {
  @IsUUID()
  locationId!: string;

  @IsObject()
  settings!: Record<string, unknown>;
}
