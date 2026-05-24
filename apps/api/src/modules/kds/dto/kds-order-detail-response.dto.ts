import { KdsOrderDetailView } from '../types/kds-order.views';

export class KdsOrderDetailResponseDto implements KdsOrderDetailView {
  id!: string;
  orderNumber!: string | null;
  status!: KdsOrderDetailView['status'];
  orderType!: KdsOrderDetailView['orderType'];
  locationId!: string;
  createdAt!: string;
  updatedAt!: string | null;
  subtotal!: string;
  total!: string;
  lineItems!: KdsOrderDetailView['lineItems'];
}
