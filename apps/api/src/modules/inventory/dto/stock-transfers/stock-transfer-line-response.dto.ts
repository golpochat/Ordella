export class StockTransferLineResponseDto {
  id!: string;
  stockItemId!: string;
  itemId!: string | null;
  itemName?: string | null;
  quantity!: string;
  quantityRequested!: string;
  quantitySent!: string;
  quantityReceived!: string;
}
