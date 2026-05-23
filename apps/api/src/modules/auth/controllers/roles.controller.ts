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
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { CreateRoleDto } from '../dto/roles/create-role.dto';
import { AssignPermissionsDto } from '../dto/roles/assign-permissions.dto';
import { RoleResponseDto } from '../dto/roles/role-response.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { RolesService } from '../services/roles.service';

@Controller('roles')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
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

  @Post(':id/assign')
  @RequirePermissions('roles:assign')
  async assignPermissions(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsDto,
  ): Promise<ApiSuccessResponse<null>> {
    await this.rolesService.assignPermissions(tenant, id, dto);
    return { success: true, data: null };
  }
}
