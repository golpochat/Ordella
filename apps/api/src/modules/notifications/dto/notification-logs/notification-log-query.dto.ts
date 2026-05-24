import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../auth/dto/pagination-query.dto';

/** API Spec §10.6 GET /api/v1/notifications/logs */
export class NotificationLogQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  notificationId?: string;

  @IsOptional()
  @IsUUID()
  channelId?: string;
}
