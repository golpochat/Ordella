import { StockReferenceType } from '../../enums/stock-reference-type.enum';

export class StockReservationResponseDto {
  id!: string;
  tenantId!: string;
  stockItemId!: string;
  locationId!: string;
  quantity!: string;
  status!: string;
  referenceType!: StockReferenceType;
  referenceId!: string;
  expiresAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
