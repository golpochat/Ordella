import { NotificationStatus } from '../../enums/notification-status.enum';
import { NotificationType } from '../../enums/notification-type.enum';

export class NotificationResponseDto {
  id!: string;
  tenantId!: string;
  type!: NotificationType;
  userId!: string | null;
  recipient!: string | null;
  channelId!: string | null;
  templateId!: string | null;
  payload!: Record<string, unknown>;
  status!: NotificationStatus;
  scheduledAt!: Date | null;
  sentAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
