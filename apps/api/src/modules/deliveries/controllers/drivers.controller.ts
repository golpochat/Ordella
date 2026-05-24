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
import { DeliveryPermissionKeys } from '../constants/permission-keys';
import { CreateDriverDto } from '../dto';
import { DriverResponseDto } from '../dto';
import { UpdateDriverDto } from '../dto';
import { DriversService } from '../services';

/** API Spec §7.4 — backed by `driver_profiles` */
@Controller('drivers')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @RequirePermissions(DeliveryPermissionKeys.DRIVERS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<DriverResponseDto[]>> {
    const data = await this.driversService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(DeliveryPermissionKeys.DRIVERS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateDriverDto,
  ): Promise<ApiSuccessResponse<DriverResponseDto>> {
    const data = await this.driversService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(DeliveryPermissionKeys.DRIVERS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<DriverResponseDto>> {
    const data = await this.driversService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(DeliveryPermissionKeys.DRIVERS_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverDto,
  ): Promise<ApiSuccessResponse<DriverResponseDto>> {
    const data = await this.driversService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions(DeliveryPermissionKeys.DRIVERS_DELETE)
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.driversService.remove(tenant, id);
    return { success: true, data: null };
  }
}
