import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  BindEdgeDeviceDto,
  PushOfflineSyncDto,
  ResolveOfflineConflictDto,
  UpdateOfflineLocationSettingDto,
} from '../dto';
import { OfflineSyncService } from '../services';

@Controller('offline-sync')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class OfflineSyncController {
  constructor(private readonly offlineSync: OfflineSyncService) {}

  @Get('dashboard')
  @RequirePermissions('offline-sync.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.dashboard(tenant);
    return { success: true, data };
  }

  @Post('devices/bind')
  @RequirePermissions('offline-sync.devices')
  async bindDevice(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: BindEdgeDeviceDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.bindDevice(tenant, user, dto);
    return { success: true, data };
  }

  @Get('bootstrap')
  @RequirePermissions('offline-sync.read')
  async bootstrap(
    @CurrentTenant() tenant: TenantContext,
    @Query('locationId', ParseUUIDPipe) locationId: string,
    @Query('deviceId') deviceId?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.bootstrap(tenant, locationId, deviceId);
    return { success: true, data };
  }

  @Get('deltas')
  @RequirePermissions('offline-sync.read')
  async deltas(
    @CurrentTenant() tenant: TenantContext,
    @Query('locationId', ParseUUIDPipe) locationId: string,
    @Query('cursor') cursor?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.deltas(tenant, locationId, cursor);
    return { success: true, data };
  }

  @Post('push')
  @RequirePermissions('offline-sync.push')
  async push(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: PushOfflineSyncDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.push(tenant, user, dto);
    return { success: true, data };
  }

  @Get('settings')
  @RequirePermissions('offline-sync.controls')
  async settings(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.listSettings(tenant);
    return { success: true, data };
  }

  @Post('settings')
  @RequirePermissions('offline-sync.controls')
  async updateSetting(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpdateOfflineLocationSettingDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.updateSetting(tenant, user, dto);
    return { success: true, data };
  }

  @Get('logs')
  @RequirePermissions('offline-sync.logs')
  async logs(
    @CurrentTenant() tenant: TenantContext,
    @Query('locationId') locationId?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.listLogs(tenant, locationId);
    return { success: true, data };
  }

  @Get('conflicts')
  @RequirePermissions('offline-sync.conflicts')
  async conflicts(
    @CurrentTenant() tenant: TenantContext,
    @Query('locationId') locationId?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.listConflicts(tenant, locationId);
    return { success: true, data };
  }

  @Post('conflicts/:id/resolve')
  @RequirePermissions('offline-sync.resolve')
  async resolveConflict(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveOfflineConflictDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.resolveConflict(tenant, user, id, dto);
    return { success: true, data };
  }

  @Post('force-sync')
  @RequirePermissions('offline-sync.force')
  async forceSync(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body('locationId', ParseUUIDPipe) locationId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSync.forceSync(tenant, user, locationId);
    return { success: true, data };
  }
}
