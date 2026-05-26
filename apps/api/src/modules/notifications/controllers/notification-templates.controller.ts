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
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { FilterPaginationDto } from '../../../common/dto';
import { NotificationsPermissionKeys } from '../constants/permission-keys';
import { CreateNotificationTemplateDto, PreviewNotificationTemplateDto, TestNotificationTemplateDto } from '../dto';
import { NotificationTemplateResponseDto } from '../dto';
import { UpdateNotificationTemplateDto } from '../dto';
import { NotificationTemplatesService } from '../services';

/** API Spec §10.2 */
@Controller('notification-templates')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class NotificationTemplatesController {
  constructor(private readonly notificationTemplatesService: NotificationTemplatesService) {}

  @Get()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_TEMPLATES_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
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

  @Post('preview')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_TEMPLATES_READ)
  async preview(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PreviewNotificationTemplateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.notificationTemplatesService.preview(tenant, dto);
    return { success: true, data };
  }

  @Post('test-send')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_TEMPLATES_CREATE)
  async testSend(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: TestNotificationTemplateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.notificationTemplatesService.testSend(tenant, dto);
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
