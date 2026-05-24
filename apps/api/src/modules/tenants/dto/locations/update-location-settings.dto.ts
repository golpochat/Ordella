import { IsObject } from 'class-validator';

/** API Spec §2.3 — location settings */
export class UpdateLocationSettingsDto {
  @IsObject()
  settings!: Record<string, unknown>;
}
