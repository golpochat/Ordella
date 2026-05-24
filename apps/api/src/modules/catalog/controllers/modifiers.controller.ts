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
import { CreateModifierDto } from '../dto/modifiers/create-modifier.dto';
import { UpdateModifierDto } from '../dto/modifiers/update-modifier.dto';
import { ModifierResponseDto } from '../dto/modifiers/modifier-response.dto';
import { ModifiersService } from '../services/modifiers.service';

/** API Spec §3.3 */
@Controller('modifiers')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ModifiersController {
  constructor(private readonly modifiersService: ModifiersService) {}

  @Get()
  @RequirePermissions('modifiers:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<ModifierResponseDto[]>> {
    const data = await this.modifiersService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('modifiers:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateModifierDto,
  ): Promise<ApiSuccessResponse<ModifierResponseDto>> {
    const data = await this.modifiersService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('modifiers:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<ModifierResponseDto>> {
    const data = await this.modifiersService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('modifiers:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModifierDto,
  ): Promise<ApiSuccessResponse<ModifierResponseDto>> {
    const data = await this.modifiersService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('modifiers:delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.modifiersService.remove(tenant, id);
    return { success: true, data: null };
  }
}
