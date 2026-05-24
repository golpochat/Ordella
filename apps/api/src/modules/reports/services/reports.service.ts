import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { FilterReportDateRangeDto } from '../dto/reports/filter-report-date-range.dto';
import { SalesReportResponseDto } from '../dto/reports/sales-report-response.dto';
import { OrdersReportResponseDto } from '../dto/reports/orders-report-response.dto';
import { CustomersReportResponseDto } from '../dto/reports/customers-report-response.dto';
import { InventoryReportResponseDto } from '../dto/reports/inventory-report-response.dto';
import { CreateExportReportDto } from '../dto/reports/create-export-report.dto';
import { ExportReportResponseDto } from '../dto/reports/export-report-response.dto';
import { CreateReportDto } from '../dto/reports/create-report.dto';
import { ReportResponseDto } from '../dto/reports/report-response.dto';

@Injectable()
export class ReportsAnalyticsService {
  getSalesReport(
    _tenant: TenantContext,
    _query: FilterReportDateRangeDto,
  ): Promise<SalesReportResponseDto> {
    throw new NotImplementedException('get sales report');
  }

  getOrdersReport(
    _tenant: TenantContext,
    _query: FilterReportDateRangeDto,
  ): Promise<OrdersReportResponseDto> {
    throw new NotImplementedException('get orders report');
  }

  getCustomersReport(
    _tenant: TenantContext,
    _query: FilterReportDateRangeDto,
  ): Promise<CustomersReportResponseDto> {
    throw new NotImplementedException('get customers report');
  }

  getInventoryReport(
    _tenant: TenantContext,
    _query: FilterReportDateRangeDto,
  ): Promise<InventoryReportResponseDto> {
    throw new NotImplementedException('get inventory report');
  }

  exportReport(_tenant: TenantContext, _dto: CreateExportReportDto): Promise<ExportReportResponseDto> {
    throw new NotImplementedException('export report');
  }
}

@Injectable()
export class ReportsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<ReportResponseDto[]> {
    throw new NotImplementedException('findAll reports');
  }

  create(_tenant: TenantContext, _dto: CreateReportDto): Promise<ReportResponseDto> {
    throw new NotImplementedException('create report');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<ReportResponseDto> {
    throw new NotImplementedException('findOne report');
  }
}
