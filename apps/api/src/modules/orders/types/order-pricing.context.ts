import { TenantContext } from '../../../common/interfaces';
import { OrderType } from '../enums/order-type.enum';

export interface OrderPricingContext {
  tenant: TenantContext;
  locationId: string;
  orderType: OrderType;
  deliveryFeeOverride?: string;
}
