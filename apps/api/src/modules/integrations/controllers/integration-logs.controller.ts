import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { IntegrationsPermissionKeys } from '../constants/permission-keys';
import { IntegrationLogQueryDto } from '../dto/integration-logs/integration-log-query.dto';
import { IntegrationLogResponseDto } from '../dto/integration-logs/integration-log-response.dto';
import { IntegrationLogsService } from '../services/integration-logs.service';

@Controller('integration-logs')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class IntegrationLogsController {
  constructor(private readonly integrationLogsService: IntegrationLogsService) {}

  @Get()
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_LOGS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: IntegrationLogQueryDto,
  ): Promise<ApiSuccessResponse<IntegrationLogResponseDto[]>> {
    const data = await this.integrationLogsService.findAll(tenant, query);
    return { success: true, data };
  }
}
