import { Injectable } from '@nestjs/common';
import { normalizeDateRange } from '../domain/report-date.util';
import { DailySalesSummaryRepository } from '../repositories/daily-sales-summary.repository';
import { InventoryMovementSummaryRepository } from '../repositories/inventory-movement-summary.repository';
import { DeliveryPerformanceSummaryRepository } from '../repositories/delivery-performance-summary.repository';
import { PromotionUsageSummaryRepository } from '../repositories/promotion-usage-summary.repository';
import { ReportDateRange } from '../types/report-ingest-event.input';
import { DailySalesSummaryEntity } from '../entities/daily-sales-summary.entity';
import { InventoryMovementSummaryEntity } from '../entities/inventory-movement-summary.entity';
import { DeliveryPerformanceSummaryEntity } from '../entities/delivery-performance-summary.entity';
import { PromotionUsageSummaryEntity } from '../entities/promotion-usage-summary.entity';

export interface DailySalesReportView {
  date: string;
  totalOrders: number;
  totalRevenue: string;
  totalDiscounts: string;
  totalRefunds: string;
}

export interface InventoryMovementReportView {
  date: string;
  productId: string;
  quantityIn: string;
  quantityOut: string;
}

export interface DeliveryPerformanceReportView {
  date: string;
  completed: number;
  failed: number;
  avgDeliveryTime: string;
}

export interface PromotionUsageReportView {
  date: string;
  promotionId: string;
  applicationCount: number;
  totalDiscount: string;
}

@Injectable()
export class ReportsQueryService {
  constructor(
    private readonly dailySalesRepository: DailySalesSummaryRepository,
    private readonly inventoryMovementRepository: InventoryMovementSummaryRepository,
    private readonly deliveryPerformanceRepository: DeliveryPerformanceSummaryRepository,
    private readonly promotionUsageRepository: PromotionUsageSummaryRepository,
  ) {}

  async getDailySales(
    tenantId: string,
    dateRange: Partial<ReportDateRange>,
  ): Promise<DailySalesReportView[]> {
    const range = normalizeDateRange(dateRange.from, dateRange.to);
    const rows = await this.dailySalesRepository.findForTenantInRange(tenantId, range);
    return rows.map((row) => this.mapDailySales(row));
  }

  async getInventoryMovements(
    tenantId: string,
    dateRange: Partial<ReportDateRange>,
  ): Promise<InventoryMovementReportView[]> {
    const range = normalizeDateRange(dateRange.from, dateRange.to);
    const rows = await this.inventoryMovementRepository.findForTenantInRange(tenantId, range);
    return rows.map((row) => this.mapInventory(row));
  }

  async getDeliveryPerformance(
    tenantId: string,
    dateRange: Partial<ReportDateRange>,
  ): Promise<DeliveryPerformanceReportView[]> {
    const range = normalizeDateRange(dateRange.from, dateRange.to);
    const rows = await this.deliveryPerformanceRepository.findForTenantInRange(tenantId, range);
    return rows.map((row) => this.mapDelivery(row));
  }

  async getPromotionUsage(
    tenantId: string,
    dateRange: Partial<ReportDateRange>,
  ): Promise<PromotionUsageReportView[]> {
    const range = normalizeDateRange(dateRange.from, dateRange.to);
    const rows = await this.promotionUsageRepository.findForTenantInRange(tenantId, range);
    return rows.map((row) => this.mapPromotion(row));
  }

  private mapDailySales(row: DailySalesSummaryEntity): DailySalesReportView {
    return {
      date: row.summaryDate,
      totalOrders: row.totalOrders,
      totalRevenue: row.totalRevenue,
      totalDiscounts: row.totalDiscounts,
      totalRefunds: row.totalRefunds,
    };
  }

  private mapInventory(row: InventoryMovementSummaryEntity): InventoryMovementReportView {
    return {
      date: row.summaryDate,
      productId: row.productId,
      quantityIn: row.quantityIn,
      quantityOut: row.quantityOut,
    };
  }

  private mapDelivery(row: DeliveryPerformanceSummaryEntity): DeliveryPerformanceReportView {
    return {
      date: row.summaryDate,
      completed: row.completed,
      failed: row.failed,
      avgDeliveryTime: row.avgDeliveryTime,
    };
  }

  private mapPromotion(row: PromotionUsageSummaryEntity): PromotionUsageReportView {
    return {
      date: row.summaryDate,
      promotionId: row.promotionId,
      applicationCount: row.applicationCount,
      totalDiscount: row.totalDiscount,
    };
  }
}
