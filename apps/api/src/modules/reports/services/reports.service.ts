import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto';
import { FilterReportDateRangeDto } from '../dto';
import { SalesReportResponseDto } from '../dto';
import { OrdersReportResponseDto } from '../dto';
import { CustomersReportResponseDto } from '../dto';
import { InventoryReportResponseDto } from '../dto';
import { CreateExportReportDto } from '../dto';
import { ExportReportResponseDto } from '../dto';
import { CreateReportDto } from '../dto';
import { ReportResponseDto } from '../dto';

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
