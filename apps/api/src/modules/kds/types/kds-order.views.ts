import { OrderStatus } from '../../orders/enums/order-status.enum';
import { OrderType } from '../../orders/enums/order-type.enum';
import { KdsLineStatus } from '../enums/kds-line-status.enum';

export interface KdsLineItemView {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  notes: string | null;
  kdsStatus: KdsLineStatus;
  station: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface KdsOrderSummaryView {
  id: string;
  orderNumber: string | null;
  status: OrderStatus;
  orderType: OrderType;
  locationId: string;
  createdAt: string;
  lineItems: KdsLineItemView[];
}

export interface KdsOrderDetailView extends KdsOrderSummaryView {
  subtotal: string;
  total: string;
  updatedAt: string | null;
}
