import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateNotificationChannelDto } from '../dto/notification-channels/create-notification-channel.dto';
import { NotificationChannelResponseDto } from '../dto/notification-channels/notification-channel-response.dto';
import { UpdateNotificationChannelDto } from '../dto/notification-channels/update-notification-channel.dto';

@Injectable()
export class NotificationChannelsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterPaginationDto,
  ): Promise<NotificationChannelResponseDto[]> {
    throw new NotImplementedException('findAll notification channels');
  }

  create(
    _tenant: TenantContext,
    _dto: CreateNotificationChannelDto,
  ): Promise<NotificationChannelResponseDto> {
    throw new NotImplementedException('create notification channel');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<NotificationChannelResponseDto> {
    throw new NotImplementedException('findOne notification channel');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateNotificationChannelDto,
  ): Promise<NotificationChannelResponseDto> {
    throw new NotImplementedException('update notification channel');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove notification channel');
  }
}
