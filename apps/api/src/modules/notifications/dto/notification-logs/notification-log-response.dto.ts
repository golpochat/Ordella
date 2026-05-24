import { NotificationLogStatus } from '../../enums/notification-log-status.enum';

export class NotificationLogResponseDto {
  id!: string;
  tenantId!: string;
  notificationId!: string;
  channelId!: string | null;
  status!: NotificationLogStatus;
  providerResponse!: Record<string, unknown>;
  errorMessage!: string | null;
  createdAt!: Date;
}
