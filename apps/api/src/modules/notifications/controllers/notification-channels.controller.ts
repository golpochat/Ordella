import {
  Body,
  Controller,
  Delete,
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
import { CreateNotificationChannelDto } from '../dto/notification-channels/create-notification-channel.dto';
import { NotificationChannelResponseDto } from '../dto/notification-channels/notification-channel-response.dto';
import { UpdateNotificationChannelDto } from '../dto/notification-channels/update-notification-channel.dto';
import { NotificationChannelsService } from '../services/notification-channels.service';

/** SRS §22 — multi-channel configuration */
@Controller('notification-channels')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class NotificationChannelsController {
  constructor(private readonly notificationChannelsService: NotificationChannelsService) {}

  @Get()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_CHANNELS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<NotificationChannelResponseDto[]>> {
    const data = await this.notificationChannelsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_CHANNELS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateNotificationChannelDto,
  ): Promise<ApiSuccessResponse<NotificationChannelResponseDto>> {
    const data = await this.notificationChannelsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_CHANNELS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<NotificationChannelResponseDto>> {
    const data = await this.notificationChannelsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_CHANNELS_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNotificationChannelDto,
  ): Promise<ApiSuccessResponse<NotificationChannelResponseDto>> {
    const data = await this.notificationChannelsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_CHANNELS_DELETE)
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.notificationChannelsService.remove(tenant, id);
    return { success: true, data: null };
  }
}
