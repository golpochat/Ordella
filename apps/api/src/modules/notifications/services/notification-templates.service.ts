import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto';
import { CreateNotificationTemplateDto } from '../dto';
import { NotificationTemplateResponseDto } from '../dto';
import { UpdateNotificationTemplateDto } from '../dto';

@Injectable()
export class NotificationTemplatesService {
  findAll(
    _tenant: TenantContext,
    _query: FilterPaginationDto,
  ): Promise<NotificationTemplateResponseDto[]> {
    throw new NotImplementedException('findAll notification templates');
  }

  create(
    _tenant: TenantContext,
    _dto: CreateNotificationTemplateDto,
  ): Promise<NotificationTemplateResponseDto> {
    throw new NotImplementedException('create notification template');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<NotificationTemplateResponseDto> {
    throw new NotImplementedException('findOne notification template');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateNotificationTemplateDto,
  ): Promise<NotificationTemplateResponseDto> {
    throw new NotImplementedException('update notification template');
  }
}
