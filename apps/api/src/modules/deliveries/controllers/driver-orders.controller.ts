import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { DeliveryPermissionKeys } from '../constants/permission-keys';
import { DriverOrderActionDto, DriverLocationUpdateDto, DriverOrderResponseDto } from '../dto/driver-orders';
import { DriverOrdersService } from '../services/driver-orders.service';

@Controller('driver/orders')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class DriverOrdersController {
  constructor(private readonly driverOrdersService: DriverOrdersService) {}

  @Get('assigned')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_READ)
  async getAssigned(
    @CurrentTenant() tenant: TenantContext,
    @Query('driverId') driverId: string,
  ): Promise<ApiSuccessResponse<DriverOrderResponseDto[]>> {
    const data = await this.driverOrdersService.getAssigned(tenant.tenantId, driverId);
    return { success: true, data };
  }

  @Get('available')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_READ)
  async getAvailable(
    @CurrentTenant() tenant: TenantContext,
    @Query('driverId') driverId: string,
  ): Promise<ApiSuccessResponse<DriverOrderResponseDto[]>> {
    const data = await this.driverOrdersService.getAvailable(tenant.tenantId, driverId);
    return { success: true, data };
  }

  @Get('completed')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_READ)
  async getCompleted(
    @CurrentTenant() tenant: TenantContext,
    @Query('driverId') driverId: string,
  ): Promise<ApiSuccessResponse<DriverOrderResponseDto[]>> {
    const data = await this.driverOrdersService.getCompleted(tenant.tenantId, driverId);
    return { success: true, data };
  }

  @Post('accept')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_UPDATE)
  async accept(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: DriverOrderActionDto,
  ): Promise<ApiSuccessResponse<DriverOrderResponseDto>> {
    const data = await this.driverOrdersService.accept(tenant, dto.orderId, dto.driverId);
    return { success: true, data };
  }

  @Post('start')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_UPDATE)
  async start(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: DriverOrderActionDto,
  ): Promise<ApiSuccessResponse<DriverOrderResponseDto>> {
    const data = await this.driverOrdersService.startDelivery(tenant, dto.orderId, dto.driverId);
    return { success: true, data };
  }

  @Post('complete')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_UPDATE)
  async complete(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: DriverOrderActionDto,
  ): Promise<ApiSuccessResponse<DriverOrderResponseDto>> {
    const data = await this.driverOrdersService.completeDelivery(tenant, dto.orderId, dto.driverId);
    return { success: true, data };
  }

  @Post('pickup-complete')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_UPDATE)
  async pickupComplete(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: DriverOrderActionDto,
  ): Promise<ApiSuccessResponse<DriverOrderResponseDto>> {
    const data = await this.driverOrdersService.pickupComplete(tenant, dto.orderId, dto.driverId);
    return { success: true, data };
  }
}

@Controller('driver/location')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class DriverLocationController {
  constructor(private readonly driverOrdersService: DriverOrdersService) {}

  @Post('update')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_UPDATE)
  async updateLocation(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: DriverLocationUpdateDto,
  ): Promise<ApiSuccessResponse<{ ok: true }>> {
    const data = await this.driverOrdersService.updateLocation(
      tenant.tenantId,
      dto.driverId,
      dto.lat,
      dto.lng,
    );
    return { success: true, data };
  }
}
