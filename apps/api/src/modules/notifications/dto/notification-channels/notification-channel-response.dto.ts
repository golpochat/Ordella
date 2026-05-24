import { NotificationChannelType } from '../../enums/notification-channel-type.enum';

export class NotificationChannelResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  channelType!: NotificationChannelType;
  config!: Record<string, unknown>;
  isEnabled!: boolean;
  createdAt!: Date;
  updatedAt!: Date | null;
}
