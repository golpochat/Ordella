import { OnlineBasketLine } from '../types';

export class OnlineBasketResponseDto {
  sessionId!: string;
  locationId!: string;
  items!: OnlineBasketLine[];
  couponCode?: string;
  orderId?: string;
  createdAt!: string;
  updatedAt!: string;
}
