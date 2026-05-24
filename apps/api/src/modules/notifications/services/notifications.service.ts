import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateNotificationDto } from '../dto/notifications/create-notification.dto';
import { NotificationResponseDto } from '../dto/notifications/notification-response.dto';

@Injectable()
export class NotificationsService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<NotificationResponseDto[]> {
    throw new NotImplementedException('findAll notifications');
  }

  create(_tenant: TenantContext, _dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    throw new NotImplementedException('create notification');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<NotificationResponseDto> {
    throw new NotImplementedException('findOne notification');
  }
}
