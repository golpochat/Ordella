import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { IntegrationsPermissionKeys } from '../constants/permission-keys';
import { FilterIntegrationEventDto } from '../dto/integration-events/filter-integration-event.dto';
import { IntegrationEventResponseDto } from '../dto/integration-events/integration-event-response.dto';
import { IntegrationEventsService } from '../services/integration-events.service';

@Controller('integration-events')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class IntegrationEventsController {
  constructor(private readonly integrationEventsService: IntegrationEventsService) {}

  @Get()
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_EVENTS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterIntegrationEventDto,
  ): Promise<ApiSuccessResponse<IntegrationEventResponseDto[]>> {
    const data = await this.integrationEventsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_EVENTS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<IntegrationEventResponseDto>> {
    const data = await this.integrationEventsService.findOne(tenant, id);
    return { success: true, data };
  }
}
