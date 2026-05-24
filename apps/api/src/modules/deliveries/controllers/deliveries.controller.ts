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
import { DeliveryPermissionKeys } from '../constants/permission-keys';
import { CreateDeliveryDto } from '../dto';
import { DeliveryResponseDto } from '../dto';
import { DeliveryTrackingPointResponseDto } from '../dto';
import { UpdateDeliveryDto } from '../dto';
import { DeliveryStatusHistoryResponseDto } from '../dto';
import { DeliveriesService } from '../services';

/** API Spec §7.1–§7.3 — backed by `delivery_tasks` */
@Controller('deliveries')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<DeliveryResponseDto[]>> {
    const data = await this.deliveriesService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateDeliveryDto,
  ): Promise<ApiSuccessResponse<DeliveryResponseDto>> {
    const data = await this.deliveriesService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<DeliveryResponseDto>> {
    const data = await this.deliveriesService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeliveryDto,
  ): Promise<ApiSuccessResponse<DeliveryResponseDto>> {
    const data = await this.deliveriesService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Get(':id/tracking')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_READ)
  async getTracking(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<DeliveryTrackingPointResponseDto[]>> {
    const data = await this.deliveriesService.getTracking(tenant, id, query);
    return { success: true, data };
  }

  @Get(':id/status-history')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_READ)
  async getStatusHistory(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<DeliveryStatusHistoryResponseDto[]>> {
    const data = await this.deliveriesService.getStatusHistory(tenant, id, query);
    return { success: true, data };
  }

  @Post(':id/auto-assign')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERIES_ASSIGN)
  async autoAssign(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<DeliveryResponseDto>> {
    const data = await this.deliveriesService.autoAssign(tenant, id);
    return { success: true, data };
  }
}
