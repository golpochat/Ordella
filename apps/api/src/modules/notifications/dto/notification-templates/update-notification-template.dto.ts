import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

/** API Spec §10.2 PATCH /api/v1/notification-templates/{id} */
export class UpdateNotificationTemplateDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
