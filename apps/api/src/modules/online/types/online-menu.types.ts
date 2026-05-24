export interface OnlineCategoryView {
  id: string;
  name: string;
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

export interface OnlineProductView {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  price: string;
  sortOrder: number;
  availableQuantity: number | null;
  modifiers: OnlineModifierView[];
}

export interface OnlinePublicMenuView {
  categories: OnlineCategoryView[];
  products: OnlineProductView[];
}
