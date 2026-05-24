import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { ReportsPermissionKeys } from '../constants/permission-keys';
import { FilterReportResultDto } from '../dto/report-results/filter-report-result.dto';
import { ReportResultResponseDto } from '../dto/report-results/report-result-response.dto';
import { ReportResultsService } from '../services/report-results.service';

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
