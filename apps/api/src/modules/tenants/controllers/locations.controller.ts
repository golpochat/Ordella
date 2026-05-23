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
import { CreateLocationDto } from '../dto/locations/create-location.dto';
import { UpdateLocationDto } from '../dto/locations/update-location.dto';
import { UpdateLocationStatusDto } from '../dto/locations/update-location-status.dto';
import { LocationResponseDto } from '../dto/locations/location-response.dto';
import {
  LocationSettingsResponseDto,
  UpdateLocationSettingsDto,
} from '../dto/locations/location-settings.dto';
import {
  LocationOpeningHoursResponseDto,
  UpdateLocationOpeningHoursDto,
} from '../dto/locations/location-opening-hours.dto';
import { LocationsService } from '../services/locations.service';

/** API Spec §2.2–§2.5 — locations */
@Controller('locations')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @RequirePermissions('locations:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<LocationResponseDto[]>> {
    const data = await this.locationsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('locations:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateLocationDto,
  ): Promise<ApiSuccessResponse<LocationResponseDto>> {
    const data = await this.locationsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('locations:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<LocationResponseDto>> {
    const data = await this.locationsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('locations:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<ApiSuccessResponse<LocationResponseDto>> {
    const data = await this.locationsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('locations:delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.locationsService.remove(tenant, id);
    return { success: true, data: null };
  }

  @Patch(':id/status')
  @RequirePermissions('locations:update')
  async updateStatus(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationStatusDto,
  ): Promise<ApiSuccessResponse<LocationResponseDto>> {
    const data = await this.locationsService.updateStatus(tenant, id, dto);
    return { success: true, data };
  }

  @Get(':id/settings')
  @RequirePermissions('locations:read')
  async getSettings(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<LocationSettingsResponseDto>> {
    const data = await this.locationsService.getSettings(tenant, id);
    return { success: true, data };
  }

  @Patch(':id/settings')
  @RequirePermissions('locations:update')
  async updateSettings(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationSettingsDto,
  ): Promise<ApiSuccessResponse<LocationSettingsResponseDto>> {
    const data = await this.locationsService.updateSettings(tenant, id, dto);
    return { success: true, data };
  }

  @Get(':id/hours')
  @RequirePermissions('locations:read')
  async getOpeningHours(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<LocationOpeningHoursResponseDto>> {
    const data = await this.locationsService.getOpeningHours(tenant, id);
    return { success: true, data };
  }

  @Patch(':id/hours')
  @RequirePermissions('locations:update')
  async updateOpeningHours(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationOpeningHoursDto,
  ): Promise<ApiSuccessResponse<LocationOpeningHoursResponseDto>> {
    const data = await this.locationsService.updateOpeningHours(tenant, id, dto);
    return { success: true, data };
  }
}
