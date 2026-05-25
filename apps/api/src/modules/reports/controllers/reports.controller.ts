import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { FilterPaginationDto } from '../../../common/dto';
import { ReportsPermissionKeys } from '../constants/permission-keys';
import { CreateReportDto } from '../dto';
import { CustomersReportResponseDto } from '../dto';
import { CreateExportReportDto } from '../dto';
import { ExportReportResponseDto } from '../dto';
import { InventoryReportResponseDto } from '../dto';
import { OrdersReportResponseDto } from '../dto';
import { FilterReportDateRangeDto } from '../dto';
import { ReportResponseDto } from '../dto';
import { SalesReportResponseDto } from '../dto';
import { ReportsAnalyticsService, ReportsService } from '../services';

/** API Spec §12 */
@Controller('reports')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ReportsController {
  constructor(
    private readonly reportsAnalyticsService: ReportsAnalyticsService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get('sales')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async getSales(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterReportDateRangeDto,
  ): Promise<ApiSuccessResponse<SalesReportResponseDto>> {
    const data = await this.reportsAnalyticsService.getSalesReport(tenant, query);
    return { success: true, data };
  }

  @Get('summary')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async getSummary(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterReportDateRangeDto,
  ): Promise<ApiSuccessResponse<Record<string, unknown>>> {
    const data = await this.reportsAnalyticsService.getSummaryReport(tenant, query);
    return { success: true, data };
  }

  @Get('orders')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async getOrders(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterReportDateRangeDto,
  ): Promise<ApiSuccessResponse<OrdersReportResponseDto>> {
    const data = await this.reportsAnalyticsService.getOrdersReport(tenant, query);
    return { success: true, data };
  }

  @Get('customers')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async getCustomers(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterReportDateRangeDto,
  ): Promise<ApiSuccessResponse<CustomersReportResponseDto>> {
    const data = await this.reportsAnalyticsService.getCustomersReport(tenant, query);
    return { success: true, data };
  }

  @Get('inventory')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async getInventory(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterReportDateRangeDto,
  ): Promise<ApiSuccessResponse<InventoryReportResponseDto>> {
    const data = await this.reportsAnalyticsService.getInventoryReport(tenant, query);
    return { success: true, data };
  }

  @Get('tax')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async getTax(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterReportDateRangeDto,
  ): Promise<ApiSuccessResponse<Record<string, unknown>>> {
    const data = await this.reportsAnalyticsService.getTaxReport(tenant, query);
    return { success: true, data };
  }

  @Get('export')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_EXPORT)
  async getExports(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.reportsAnalyticsService.listExportJobs(tenant);
    return { success: true, data };
  }

  @Post('export')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_EXPORT)
  async export(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExportReportDto,
  ): Promise<ApiSuccessResponse<ExportReportResponseDto>> {
    const data = await this.reportsAnalyticsService.exportReport(tenant, dto, user);
    return { success: true, data };
  }

  @Post('export/create')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_EXPORT)
  async createExport(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExportReportDto,
  ): Promise<ApiSuccessResponse<ExportReportResponseDto>> {
    const data = await this.reportsAnalyticsService.exportReport(tenant, dto, user);
    return { success: true, data };
  }

  @Get()
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<ReportResponseDto[]>> {
    const data = await this.reportsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(ReportsPermissionKeys.REPORTS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateReportDto,
  ): Promise<ApiSuccessResponse<ReportResponseDto>> {
    const data = await this.reportsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<ReportResponseDto>> {
    const data = await this.reportsService.findOne(tenant, id);
    return { success: true, data };
  }
}
