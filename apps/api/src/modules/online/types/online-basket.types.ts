import { OnlineCheckoutSnapshot } from './online-checkout.types';

export interface OnlineBasketLine {
  id: string;
  productId: string;
  variantId?: string;
  bundleId?: string;
  selectedBundleItemIds?: string[];
  quantity: number;
  modifierOptionIds?: string[];
  notes?: string;
}

export interface OnlineCustomerDetails {
  name: string;
  phone: string;
  email?: string;
}

export interface OnlineDeliveryDetails {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  instructions?: string;
  contactPhone?: string;
}

export interface OnlineBasket {
  sessionId: string;
  tenantId: string;
  locationId: string;
  items: OnlineBasketLine[];
  couponCode?: string;
  checkout?: OnlineCheckoutSnapshot;
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
}
