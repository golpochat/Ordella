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
import { CreateAddonDto } from '../dto/addons/create-addon.dto';
import { UpdateAddonDto } from '../dto/addons/update-addon.dto';
import { AddonResponseDto } from '../dto/addons/addon-response.dto';
import { AddonsService } from '../services/addons.service';

/** API Spec §3.4 */
@Controller('addons')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Get()
  @RequirePermissions('addons:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<AddonResponseDto[]>> {
    const data = await this.addonsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('addons:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateAddonDto,
  ): Promise<ApiSuccessResponse<AddonResponseDto>> {
    const data = await this.addonsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('addons:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<AddonResponseDto>> {
    const data = await this.addonsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('addons:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddonDto,
  ): Promise<ApiSuccessResponse<AddonResponseDto>> {
    const data = await this.addonsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('addons:delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.addonsService.remove(tenant, id);
    return { success: true, data: null };
  }
}
