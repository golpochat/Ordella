import { NotificationChannelType } from '../../enums/notification-channel-type.enum';

export class NotificationTemplateResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  channel!: NotificationChannelType;
  subject!: string | null;
  content!: Record<string, unknown>;
  version!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date | null;
}
