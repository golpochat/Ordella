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
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { FilterPaginationDto } from '../../../common/dto';
import { NotificationsPermissionKeys } from '../constants/permission-keys';
import { CreateNotificationDto } from '../dto';
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

  @Post()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATIONS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateNotificationDto,
  ): Promise<ApiSuccessResponse<NotificationResponseDto>> {
    const data = await this.notificationsService.create(tenant, dto);
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
