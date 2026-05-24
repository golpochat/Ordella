import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { NotificationsPermissionKeys } from '../constants/permission-keys';
import { FilterNotificationLogDto } from '../dto';
import { NotificationLogResponseDto } from '../dto';
import { NotificationLogsService } from '../services';

/** API Spec §10.6 */
@Controller('notifications/logs')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class NotificationLogsController {
  constructor(private readonly notificationLogsService: NotificationLogsService) {}

  @Get()
  @RequirePermissions(NotificationsPermissionKeys.NOTIFICATION_LOGS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterNotificationLogDto,
  ): Promise<ApiSuccessResponse<NotificationLogResponseDto[]>> {
    const data = await this.notificationLogsService.findAll(tenant, query);
    return { success: true, data };
  }
}
