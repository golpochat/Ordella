import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterNotificationLogDto } from '../dto';
import { NotificationLogResponseDto } from '../dto';

@Injectable()
export class NotificationLogsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterNotificationLogDto,
  ): Promise<NotificationLogResponseDto[]> {
    throw new NotImplementedException('findAll notification logs');
  }
}
