export interface OnlineCategoryView {
  id: string;
  name: string;
  description?: string | null;
  sortOrder: number;
}

export interface OnlineModifierOptionView {
  id: string;
  name: string;
  priceDelta: string;
}

export interface OnlineModifierView {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options: OnlineModifierOptionView[];
}

export interface OnlineVariantView {
  id: string;
  name: string;
  priceDelta: string;
  sku: string | null;
}

export interface OnlineProductView {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  price: string;
  sortOrder: number;
  sku: string | null;
  imageUrl: string | null;
  availableQuantity: number | null;
  isOutOfStock: boolean;
  inventoryTrackingEnabled: boolean;
  variants: OnlineVariantView[];
  modifiers: OnlineModifierView[];
}

export interface OnlinePublicMenuView {
  categories: OnlineCategoryView[];
  products: OnlineProductView[];
}
