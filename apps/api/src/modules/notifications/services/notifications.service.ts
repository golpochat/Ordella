import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateNotificationDto } from '../dto';
import { NotificationResponseDto } from '../dto';

@Injectable()
export class NotificationsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<NotificationResponseDto[]> {
    throw new NotImplementedException('findAll notifications');
  }

  create(_tenant: TenantContext, _dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    throw new NotImplementedException('create notification');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<NotificationResponseDto> {
    throw new NotImplementedException('findOne notification');
  }
}
