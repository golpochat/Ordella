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
import { IntegrationsPermissionKeys } from '../constants/permission-keys';
import { ConnectIntegrationAppDto } from '../dto/integrations/connect-integration-app.dto';
import { IntegrationAppResponseDto } from '../dto/integrations/integration-app-response.dto';
import { UpdateIntegrationDto } from '../dto/integrations/update-integration.dto';
import { IntegrationsAppsService } from '../services/integrations.service';

/** API Spec §13.4 */
@Controller('integrations/apps')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class IntegrationsAppsController {
  constructor(private readonly integrationsAppsService: IntegrationsAppsService) {}

  @Get()
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATIONS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<IntegrationAppResponseDto[]>> {
    const data = await this.integrationsAppsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATIONS_CREATE)
  async connect(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: ConnectIntegrationAppDto,
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
