import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../../common/dto';

/** API Spec §10.6 GET /api/v1/notifications/logs */
export class FilterNotificationLogDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  notificationId?: string;

  @IsOptional()
  @IsUUID()
  channelId?: string;
}
