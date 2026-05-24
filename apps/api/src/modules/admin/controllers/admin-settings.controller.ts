import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../constants/admin-permission-keys';
import { TenantSettingsService } from '../services/tenant-settings.service';
import {
  AdminUpdateBusinessInfoDto,
  AdminUpdateDeliveryZonesDto,
  AdminUpdateOpeningHoursDto,
  AdminUpdatePaymentSettingsDto,
  AdminUpdatePosSettingsDto,
} from '../dto';

@Controller('admin/settings')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
export class AdminSettingsController {
  constructor(private readonly tenantSettingsService: TenantSettingsService) {}

  @Patch('business')
  async updateBusiness(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminUpdateBusinessInfoDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.tenantSettingsService.updateBusinessInfo(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('opening-hours')
  async updateOpeningHours(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminUpdateOpeningHoursDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.tenantSettingsService.updateOpeningHours(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Patch('delivery-zones')
  async updateDeliveryZones(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminUpdateDeliveryZonesDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.tenantSettingsService.updateDeliveryZones(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Patch('payment')
  async updatePayment(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminUpdatePaymentSettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.tenantSettingsService.updatePaymentSettings(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Patch('pos')
  async updatePos(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminUpdatePosSettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.tenantSettingsService.updatePosSettings(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Get('locations/:locationId')
  async getLocationSettings(
    @CurrentTenant() tenant: TenantContext,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.tenantSettingsService.getSettings(tenant.tenantId, locationId);
    return { success: true, data };
  }
}
