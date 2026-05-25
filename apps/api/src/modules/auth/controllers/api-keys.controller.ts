import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { JwtAuthGuard } from '../guards';
import { RbacGuard } from '../guards';
import { RequirePermissions } from '../decorators';
import { CreateApiKeyDto, RotateApiKeyDto } from '../dto';
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

  @Post(':id/revoke')
  @RequirePermissions('api-keys:delete')
  async revoke(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<ApiKeyResponseDto>> {
    const data = await this.apiKeysService.revoke(tenant, id);
    return { success: true, data };
  }

  @Patch(':id/rotate')
  @RequirePermissions('api-keys:create')
  async rotate(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RotateApiKeyDto,
  ): Promise<ApiSuccessResponse<ApiKeyResponseDto>> {
    const data = await this.apiKeysService.rotate(tenant, id, dto);
    return { success: true, data };
  }
}
