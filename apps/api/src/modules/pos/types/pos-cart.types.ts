export interface PosCartLine {
  productId: string;
  variantId?: string;
  bundleId?: string;
  quantity: number;
  modifierOptionIds?: string[];
  notes?: string;
}

export interface PosCart {
  id: string;
  tenantId: string;
  terminalId: string;
  cashierId: string;
  shiftId: string;
  locationId: string;
  items: PosCartLine[];
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
}
