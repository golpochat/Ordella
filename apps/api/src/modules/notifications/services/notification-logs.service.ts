import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterNotificationLogDto } from '../dto/notification-logs/filter-notification-log.dto';
import { NotificationLogResponseDto } from '../dto/notification-logs/notification-log-response.dto';

@Injectable()
export class NotificationLogsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterNotificationLogDto,
  ): Promise<NotificationLogResponseDto[]> {
    throw new NotImplementedException('findAll notification logs');
  }
}
