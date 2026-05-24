import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
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
