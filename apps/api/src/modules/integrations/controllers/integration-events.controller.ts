import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { IntegrationsPermissionKeys } from '../constants/permission-keys';
import { FilterIntegrationEventDto } from '../dto';
import { IntegrationEventResponseDto } from '../dto';
import { IntegrationEventsService } from '../services';

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
