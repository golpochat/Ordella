export type RecommendationChannel = 'online' | 'pos';

export type RecommendationReason =
  | 'frequently_bought_together'
  | 'frequently_viewed_together'
  | 'customer_preference'
  | 'same_category'
  | 'popular_item'
  | 'recently_viewed'
  | 'trending';

export type RecommendationProduct = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  price: string;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  isActive: boolean;
  inventoryTrackingEnabled: boolean;
  stockLevel: number | null;
  availableQuantity: number | null;
  isOutOfStock: boolean;
  variants: unknown[];
  modifiers: unknown[];
};

export type RecommendationItem = {
  item: RecommendationProduct;
  score: number;
  reason: RecommendationReason;
};

export type RecommendationResponse = {
  recommendations: RecommendationItem[];
  strategy: string[];
  generatedAt: string;
};
