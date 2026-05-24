import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreateApiKeyDto } from '../dto';
import { ApiKeyResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { ApiKeysService } from '../services';

/** API Spec §13.5 API Keys */
@Controller('api-keys')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @RequirePermissions('api-keys:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<ApiKeyResponseDto[]>> {
    const data = await this.apiKeysService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('api-keys:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateApiKeyDto,
  ): Promise<ApiSuccessResponse<ApiKeyResponseDto>> {
    const data = await this.apiKeysService.create(tenant, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('api-keys:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.apiKeysService.remove(tenant, id);
  }
}
