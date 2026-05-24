import { StockMovementType } from '../../enums/stock-movement-type.enum';
import { StockReferenceType } from '../../enums/stock-reference-type.enum';

export class StockMovementResponseDto {
  id!: string;
  tenantId!: string;
  stockItemId!: string;
  type!: StockMovementType;
  quantity!: string;
  referenceType!: StockReferenceType | null;
  referenceId!: string | null;
  notes!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
