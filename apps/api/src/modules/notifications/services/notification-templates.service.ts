import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateNotificationTemplateDto } from '../dto/notification-templates/create-notification-template.dto';
import { NotificationTemplateResponseDto } from '../dto/notification-templates/notification-template-response.dto';
import { UpdateNotificationTemplateDto } from '../dto/notification-templates/update-notification-template.dto';

@Injectable()
export class NotificationTemplatesService {
  findAll(
    _tenant: TenantContext,
    _query: PaginationQueryDto,
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
