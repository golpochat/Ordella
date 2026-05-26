import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationChannelType } from '../../enums/notification-channel-type.enum';

/** API Spec §10.2 POST /api/v1/notification-templates */
export class CreateNotificationTemplateDto {
  @IsString()
  name!: string;

  @IsEnum(NotificationChannelType)
  channel!: NotificationChannelType;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsObject()
  content!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PreviewNotificationTemplateDto {
  @IsString()
  name!: string;

  @IsEnum(NotificationChannelType)
  channel!: NotificationChannelType;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsObject()
  content!: Record<string, unknown>;

  @IsObject()
  variables!: Record<string, unknown>;
}

export class TestNotificationTemplateDto extends PreviewNotificationTemplateDto {
  @IsString()
  recipient!: string;
}
