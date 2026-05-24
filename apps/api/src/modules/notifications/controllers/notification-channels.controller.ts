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
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { FilterPaginationDto } from '../../../common/dto';
import { NotificationsPermissionKeys } from '../constants/permission-keys';
import { CreateNotificationChannelDto } from '../dto';
import { NotificationChannelResponseDto } from '../dto';
import { UpdateNotificationChannelDto } from '../dto';
import { NotificationChannelsService } from '../services';

/** SRS §22 — multi-channel configuration */
@Controller('notification-channels')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class NotificationChannelsController {
  constructor(private readonly notificationChannelsService: NotificationChannelsService) {}

  @Get()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_CHANNELS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
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
