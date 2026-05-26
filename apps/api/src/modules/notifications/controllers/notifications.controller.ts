import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { FilterPaginationDto } from '../../../common/dto';
import { NotificationsPermissionKeys } from '../constants/permission-keys';
import {
  BulkSendNotificationDto,
  CreateNotificationDto,
  NotificationPreferenceResponseDto,
  UpdateTenantNotificationSettingsDto,
  UpdateNotificationPreferenceDto,
} from '../dto';
import { NotificationResponseDto } from '../dto';
import { NotificationsService } from '../services';

/** API Spec §10.1 */
@Controller('notifications')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<NotificationResponseDto[]>> {
    const data = await this.notificationsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Get('history')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_READ)
  async history(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<NotificationResponseDto[]>> {
    const data = await this.notificationsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Get('preferences')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_READ)
  async preferences(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query('userId') userId?: string,
  ): Promise<ApiSuccessResponse<NotificationPreferenceResponseDto>> {
    const data = await this.notificationsService.getPreferences(tenant, user, userId);
    return { success: true, data };
  }

  @Get('settings')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_READ)
  async settings(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.notificationsService.getTenantNotificationSettings(tenant);
    return { success: true, data };
  }

  @Post('settings/update')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_CREATE)
  async updateSettings(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateTenantNotificationSettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.notificationsService.updateTenantNotificationSettings(tenant, dto);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateNotificationDto,
  ): Promise<ApiSuccessResponse<NotificationResponseDto>> {
    const data = await this.notificationsService.create(tenant, dto);
    return { success: true, data };
  }

  @Post('send')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_CREATE)
  async send(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateNotificationDto,
  ): Promise<ApiSuccessResponse<NotificationResponseDto>> {
    const data = await this.notificationsService.create(tenant, dto);
    return { success: true, data };
  }

  @Post('bulk-send')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_CREATE)
  async bulkSend(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: BulkSendNotificationDto,
  ): Promise<ApiSuccessResponse<NotificationResponseDto[]>> {
    const data = await this.notificationsService.bulkSend(tenant, dto);
    return { success: true, data };
  }

  @Post('preferences/update')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_CREATE)
  async updatePreferences(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpdateNotificationPreferenceDto,
  ): Promise<ApiSuccessResponse<NotificationPreferenceResponseDto>> {
    const data = await this.notificationsService.updatePreferences(tenant, user, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<NotificationResponseDto>> {
    const data = await this.notificationsService.findOne(tenant, id);
    return { success: true, data };
  }
}
