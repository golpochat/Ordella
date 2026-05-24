import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../../enums/notification-type.enum';

/** API Spec §10.1 POST /api/v1/notifications */
export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  recipient?: string;

  @IsOptional()
  @IsUUID()
  channelId?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
