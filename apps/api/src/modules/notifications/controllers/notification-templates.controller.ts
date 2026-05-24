import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { NotificationsPermissionKeys } from '../constants/permission-keys';
import { CreateNotificationTemplateDto } from '../dto/notification-templates/create-notification-template.dto';
import { NotificationTemplateResponseDto } from '../dto/notification-templates/notification-template-response.dto';
import { UpdateNotificationTemplateDto } from '../dto/notification-templates/update-notification-template.dto';
import { NotificationTemplatesService } from '../services/notification-templates.service';

/** API Spec §10.2 */
@Controller('notification-templates')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class NotificationTemplatesController {
  constructor(private readonly notificationTemplatesService: NotificationTemplatesService) {}

  @Get()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_TEMPLATES_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<NotificationTemplateResponseDto[]>> {
    const data = await this.notificationTemplatesService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_TEMPLATES_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateNotificationTemplateDto,
  ): Promise<ApiSuccessResponse<NotificationTemplateResponseDto>> {
    const data = await this.notificationTemplatesService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_TEMPLATES_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<NotificationTemplateResponseDto>> {
    const data = await this.notificationTemplatesService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_TEMPLATES_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNotificationTemplateDto,
  ): Promise<ApiSuccessResponse<NotificationTemplateResponseDto>> {
    const data = await this.notificationTemplatesService.update(tenant, id, dto);
    return { success: true, data };
  }
}
