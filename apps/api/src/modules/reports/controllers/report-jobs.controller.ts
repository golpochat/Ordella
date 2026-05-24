import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { ReportsPermissionKeys } from '../constants/permission-keys';
import { ReportJobQueryDto } from '../dto/report-jobs/report-job-query.dto';
import { ReportJobResponseDto } from '../dto/report-jobs/report-job-response.dto';
import { ReportJobsService } from '../services/report-jobs.service';

@Controller('report-jobs')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ReportJobsController {
  constructor(private readonly reportJobsService: ReportJobsService) {}

  @Get()
  @RequirePermissions(ReportsPermissionKeys.REPORT_JOBS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ReportJobQueryDto,
  ): Promise<ApiSuccessResponse<ReportJobResponseDto[]>> {
    const data = await this.reportJobsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(ReportsPermissionKeys.REPORT_JOBS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<ReportJobResponseDto>> {
    const data = await this.reportJobsService.findOne(tenant, id);
    return { success: true, data };
  }
}
