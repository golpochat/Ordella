import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { ReportsPermissionKeys } from '../constants/permission-keys';
import { FilterReportJobDto } from '../dto';
import { ReportJobResponseDto } from '../dto';
import { ReportJobsService } from '../services';

@Controller('report-jobs')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ReportJobsController {
  constructor(private readonly reportJobsService: ReportJobsService) {}

  @Get()
  @RequirePermissions(ReportsPermissionKeys.REPORT_JOBS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterReportJobDto,
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
