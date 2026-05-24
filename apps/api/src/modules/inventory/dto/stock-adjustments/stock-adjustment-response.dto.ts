export class StockAdjustmentResponseDto {
  id!: string;
  tenantId!: string;
  stockItemId!: string;
  locationId!: string;
  quantityDelta!: string;
  reason!: string | null;
  adjustedBy!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
