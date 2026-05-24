export class VariantResponseDto {
  id!: string;
  productId!: string;
  name!: string;
  priceDelta!: string;
  sku!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
