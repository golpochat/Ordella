export class OrderItemResponseDto {
  id!: string;
  orderId!: string;
  productId!: string;
  variantId!: string | null;
  quantity!: number;
  price!: string;
  notes!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
