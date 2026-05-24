export interface AnalyticsOverviewView {
  salesTotal: string;
  ordersTotal: number;
  avgOrderValue: string;
  growthPercent: number | null;
  fulfillmentTimeAvgMinutes: number | null;
  deliveryTimeAvgMinutes: number | null;
  deliveryEnabled: boolean;
}

export interface AnalyticsDayPointView {
  date: string;
  revenue: string;
  orders: number;
}

export interface AnalyticsChannelPointView {
  channel: string;
  label: string;
  revenue: string;
  orders: number;
}

export interface AnalyticsLocationPointView {
  locationId: string;
  locationName: string;
  revenue: string;
  orders: number;
}

export interface AnalyticsTopItemView {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: string;
}

export interface AnalyticsCategoryPointView {
  categoryId: string | null;
  categoryName: string;
  revenue: string;
  quantitySold: number;
}

export interface AnalyticsLowInventoryView {
  id: string;
  locationId: string;
  name: string;
  sku: string;
  quantityOnHand: string;
  reorderLevel: string | null;
  status: 'low' | 'out_of_stock';
}

export interface AnalyticsRecentOrderView {
  id: string;
  orderNumber: string | null;
  orderType: string;
  channelLabel: string;
  status: string;
  total: string;
  locationId: string;
  createdAt: string;
}
