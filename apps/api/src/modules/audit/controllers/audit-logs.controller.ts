import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AuditLogQueryDto } from '../dto';
import { AuditLogEntity } from '../entities';
import { AuditLogListResult, AuditLogService } from '../services';

@Controller('audit/logs')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions('audit.read')
export class AuditLogsController {
  constructor(private readonly auditLogs: AuditLogService) {}

  @Get()
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AuditLogQueryDto,
  ): Promise<ApiSuccessResponse<AuditLogListResult>> {
    const data = await this.auditLogs.list(tenant, query);
    return { success: true, data };
  }

  @Get(':id')
  async getById(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<AuditLogEntity>> {
    const data = await this.auditLogs.getById(tenant, id);
    return { success: true, data };
  }
}
