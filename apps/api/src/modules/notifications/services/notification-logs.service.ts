import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { NotificationLogQueryDto } from '../dto/notification-logs/notification-log-query.dto';
import { NotificationLogResponseDto } from '../dto/notification-logs/notification-log-response.dto';

@Injectable()
export class NotificationLogsService {
  findAll(
    _tenant: TenantContext,
    _query: NotificationLogQueryDto,
  ): Promise<NotificationLogResponseDto[]> {
    throw new NotImplementedException('findAll notification logs');
  }
}
