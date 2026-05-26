import { Controller, Get, Header, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
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
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AuditLogQueryDto,
  ): Promise<ApiSuccessResponse<AuditLogListResult>> {
    const data = await this.auditLogs.list(tenant, query, user);
    return { success: true, data };
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="audit-logs.csv"')
  async exportCsv(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AuditLogQueryDto,
  ): Promise<string> {
    return this.auditLogs.exportCsv(tenant, query, user);
  }

  @Get('security/events')
  async securityEvents(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AuditLogQueryDto,
  ): Promise<ApiSuccessResponse<AuditLogListResult>> {
    const data = await this.auditLogs.securityEvents(tenant, query, user);
    return { success: true, data };
  }

  @Get('security/alerts')
  async alerts(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.auditLogs.alerts(tenant, user);
    return { success: true, data };
  }

  @Get('compliance/status')
  async complianceStatus(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.auditLogs.complianceStatus(tenant, user);
    return { success: true, data };
  }

  @Get(':id')
  async getById(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<AuditLogEntity>> {
    const data = await this.auditLogs.getById(tenant, id, user);
    return { success: true, data };
  }
}
