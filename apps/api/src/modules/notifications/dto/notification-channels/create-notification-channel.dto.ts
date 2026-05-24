import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationChannelType } from '../../enums/notification-channel-type.enum';

/** SRS §22 — tenant channel configuration */
export class CreateNotificationChannelDto {
  @IsString()
  name!: string;

  @IsEnum(NotificationChannelType)
  channelType!: NotificationChannelType;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
