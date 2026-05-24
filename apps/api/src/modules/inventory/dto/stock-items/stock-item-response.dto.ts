export class StockItemResponseDto {
  id!: string;
  tenantId!: string;
  locationId!: string;
  name!: string;
  sku!: string;
  unit!: string;
  quantityOnHand!: string;
  productId!: string | null;
  reorderLevel!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
