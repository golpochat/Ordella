import { OrderStatus } from '../enums/order-status.enum';

/** Business "confirmed" step — inventory deduct and payment capture run on this status. */
export const ORDER_CONFIRMED_STATUS = OrderStatus.ACCEPTED;
