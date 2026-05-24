import { Injectable } from '@nestjs/common';
import { resolveAnalyticsRange } from '../domain/analytics-date-range';
import { AnalyticsQueryRepository } from '../repositories/analytics-query.repository';
import { AdminAnalyticsQueryDto } from '../dto/admin-analytics-query.dto';
import type {
  AnalyticsCategoryPointView,
  AnalyticsChannelPointView,
  AnalyticsDayPointView,
  AnalyticsLocationPointView,
  AnalyticsLowInventoryView,
  AnalyticsOverviewView,
  AnalyticsRecentOrderView,
  AnalyticsTopItemView,
} from '../types/analytics.views';

@Injectable()
export class AnalyticsAdminService {
  constructor(private readonly analyticsRepository: AnalyticsQueryRepository) {}

  getOverview(tenantId: string, query: AdminAnalyticsQueryDto): Promise<AnalyticsOverviewView> {
    const range = resolveAnalyticsRange(query.from, query.to);
    return this.analyticsRepository.getOverview(tenantId, range, query.locationId);
  }

  getRevenueByDay(tenantId: string, query: AdminAnalyticsQueryDto): Promise<AnalyticsDayPointView[]> {
    const range = resolveAnalyticsRange(query.from, query.to);
    return this.analyticsRepository.getRevenueByDay(tenantId, range, query.locationId);
  }

  getOrdersByDay(tenantId: string, query: AdminAnalyticsQueryDto): Promise<AnalyticsDayPointView[]> {
    const range = resolveAnalyticsRange(query.from, query.to);
    return this.analyticsRepository.getOrdersByDay(tenantId, range, query.locationId);
  }

  getSalesByChannel(
    tenantId: string,
    query: AdminAnalyticsQueryDto,
  ): Promise<AnalyticsChannelPointView[]> {
    const range = resolveAnalyticsRange(query.from, query.to);
    return this.analyticsRepository.getSalesByChannel(tenantId, range, query.locationId);
  }

  getSalesByLocation(
    tenantId: string,
    query: AdminAnalyticsQueryDto,
  ): Promise<AnalyticsLocationPointView[]> {
    const range = resolveAnalyticsRange(query.from, query.to);
    return this.analyticsRepository.getSalesByLocation(tenantId, range);
  }

  getTopItems(tenantId: string, query: AdminAnalyticsQueryDto): Promise<AnalyticsTopItemView[]> {
    const range = resolveAnalyticsRange(query.from, query.to);
    return this.analyticsRepository.getTopItems(tenantId, range, query.locationId);
  }

  getCategoryPerformance(
    tenantId: string,
    query: AdminAnalyticsQueryDto,
  ): Promise<AnalyticsCategoryPointView[]> {
    const range = resolveAnalyticsRange(query.from, query.to);
    return this.analyticsRepository.getCategoryPerformance(tenantId, range, query.locationId);
  }

  getLowInventory(
    tenantId: string,
    query: AdminAnalyticsQueryDto,
  ): Promise<AnalyticsLowInventoryView[]> {
    return this.analyticsRepository.getLowInventory(tenantId, query.locationId);
  }

  getRecentOrders(
    tenantId: string,
    query: AdminAnalyticsQueryDto,
  ): Promise<AnalyticsRecentOrderView[]> {
    return this.analyticsRepository.getRecentOrders(tenantId, query.locationId);
  }

  listLocations(tenantId: string): Promise<{ id: string; name: string }[]> {
    return this.analyticsRepository.listLocations(tenantId);
  }
}
