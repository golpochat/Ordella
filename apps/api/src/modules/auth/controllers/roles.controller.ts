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
import { JwtAuthGuard } from '../guards';
import { RbacGuard } from '../guards';
import { RequirePermissions } from '../decorators';
import { CreateRoleDto } from '../dto';
import { UpdateRolePermissionsDto } from '../dto';
import { RoleResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { RolesService } from '../services';

@Controller('roles')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<RoleResponseDto[]>> {
    const data = await this.rolesService.findAll(tenant, query);
    return { success: true, data };
  }

  @Get('list')
  @RequirePermissions('staff.read')
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<RoleResponseDto[]>> {
    const data = await this.rolesService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('roles:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateRoleDto,
  ): Promise<ApiSuccessResponse<RoleResponseDto>> {
    const data = await this.rolesService.create(tenant, dto);
    return { success: true, data };
  }

  @Post('create')
  @RequirePermissions('staff.write')
  async createAlias(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateRoleDto,
  ): Promise<ApiSuccessResponse<RoleResponseDto>> {
    const data = await this.rolesService.create(tenant, dto);
    return { success: true, data };
  }

  @Post('update')
  @RequirePermissions('staff.write')
  async updateAlias(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateRoleDto & UpdateRolePermissionsDto & { id: string },
  ): Promise<ApiSuccessResponse<RoleResponseDto>> {
    const { id, ...patch } = dto;
    const data = await this.rolesService.update(tenant, id, patch);
    return { success: true, data };
  }

  @Post('delete')
  @RequirePermissions('staff.write')
  async deleteAlias(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: { id: string },
  ): Promise<ApiSuccessResponse<null>> {
    await this.rolesService.remove(tenant, dto.id);
    return { success: true, data: null };
  }

  @Post('duplicate')
  @RequirePermissions('staff.write')
  async duplicateAlias(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: { id: string },
  ): Promise<ApiSuccessResponse<RoleResponseDto>> {
    const data = await this.rolesService.duplicate(tenant, dto.id);
    return { success: true, data };
  }

  @Post(':id/assign')
  @RequirePermissions('roles:assign')
  async assignPermissions(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ): Promise<ApiSuccessResponse<null>> {
    await this.rolesService.assignPermissions(tenant, id, dto);
    return { success: true, data: null };
  }
}
