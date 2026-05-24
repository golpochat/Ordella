import { KdsOrderSummaryView } from '../types/kds-order.views';

export class KdsOrderSummaryResponseDto implements KdsOrderSummaryView {
  id!: string;
  orderNumber!: string | null;
  status!: KdsOrderSummaryView['status'];
  orderType!: KdsOrderSummaryView['orderType'];
  locationId!: string;
  createdAt!: string;
  lineItems!: KdsOrderSummaryView['lineItems'];
}
