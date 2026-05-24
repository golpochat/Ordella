import { KdsOrderSummaryView } from '../types/kds-order.views';

export class KdsOrderSummaryResponseDto implements KdsOrderSummaryView {
  id!: string;
  orderNumber!: string | null;
  status!: KdsOrderSummaryView['status'];
  fulfillmentStatus!: string;
  orderType!: KdsOrderSummaryView['orderType'];
  customerInfo?: KdsOrderSummaryView['customerInfo'];
  locationId!: string;
  createdAt!: string;
  lineItems!: KdsOrderSummaryView['lineItems'];
}
