import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { ReportsPermissionKeys } from '../constants/permission-keys';
import { FilterReportResultDto } from '../dto';
import { ReportResultResponseDto } from '../dto';
import { ReportResultsService } from '../services';

@Controller('report-results')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ReportResultsController {
  constructor(private readonly reportResultsService: ReportResultsService) {}

  @Get()
  @RequirePermissions(ReportsPermissionKeys.REPORT_RESULTS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterReportResultDto,
  ): Promise<ApiSuccessResponse<ReportResultResponseDto[]>> {
    const data = await this.reportResultsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(ReportsPermissionKeys.REPORT_RESULTS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<ReportResultResponseDto>> {
    const data = await this.reportResultsService.findOne(tenant, id);
    return { success: true, data };
  }
}
