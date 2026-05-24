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
import { IntegrationsPermissionKeys } from '../constants/permission-keys';
import { CreateIntegrationAppDto } from '../dto';
import { IntegrationAppResponseDto } from '../dto';
import { UpdateIntegrationDto } from '../dto';
import { IntegrationsAppsService } from '../services';

/** API Spec §13.4 */
@Controller('integrations/apps')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class IntegrationsAppsController {
  constructor(private readonly integrationsAppsService: IntegrationsAppsService) {}

  @Get()
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATIONS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<IntegrationAppResponseDto[]>> {
    const data = await this.integrationsAppsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATIONS_CREATE)
  async connect(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateIntegrationAppDto,
  ): Promise<ApiSuccessResponse<IntegrationAppResponseDto>> {
    const data = await this.integrationsAppsService.connect(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATIONS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<IntegrationAppResponseDto>> {
    const data = await this.integrationsAppsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATIONS_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIntegrationDto,
  ): Promise<ApiSuccessResponse<IntegrationAppResponseDto>> {
    const data = await this.integrationsAppsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATIONS_DELETE)
  async disconnect(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.integrationsAppsService.disconnect(tenant, id);
    return { success: true, data: null };
  }
}
