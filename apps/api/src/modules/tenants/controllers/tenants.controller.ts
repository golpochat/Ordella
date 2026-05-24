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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateTenantDto } from '../dto/tenants/create-tenant.dto';
import { UpdateTenantDto } from '../dto/tenants/update-tenant.dto';
import { TenantResponseDto } from '../dto/tenants/tenant-response.dto';
import { TenantsService } from '../services/tenants.service';

/** API Spec §2.1 — platform-level tenant management */
@Controller('tenants')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @RequirePermissions('tenants:read')
  async findAll(@Query() query: FilterPaginationDto): Promise<ApiSuccessResponse<TenantResponseDto[]>> {
    const data = await this.tenantsService.findAll(query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('tenants:create')
  async create(@Body() dto: CreateTenantDto): Promise<ApiSuccessResponse<TenantResponseDto>> {
    const data = await this.tenantsService.create(dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('tenants:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApiSuccessResponse<TenantResponseDto>> {
    const data = await this.tenantsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('tenants:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
  ): Promise<ApiSuccessResponse<TenantResponseDto>> {
    const data = await this.tenantsService.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('tenants:delete')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ApiSuccessResponse<null>> {
    await this.tenantsService.remove(id);
    return { success: true, data: null };
  }
}
