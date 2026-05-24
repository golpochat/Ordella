import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { IntegrationsPermissionKeys } from '../constants/permission-keys';
import { FilterIntegrationLogDto } from '../dto';
import { IntegrationLogResponseDto } from '../dto';
import { IntegrationLogsService } from '../services';

@Controller('integration-logs')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class IntegrationLogsController {
  constructor(private readonly integrationLogsService: IntegrationLogsService) {}

  @Get()
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_LOGS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterIntegrationLogDto,
  ): Promise<ApiSuccessResponse<IntegrationLogResponseDto[]>> {
    const data = await this.integrationLogsService.findAll(tenant, query);
    return { success: true, data };
  }
}
