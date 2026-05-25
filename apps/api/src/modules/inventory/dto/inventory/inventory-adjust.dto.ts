import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export enum InventoryAdjustReason {
  MANUAL = 'manual',
  SALE = 'sale',
  REFUND = 'refund',
  WASTE = 'waste',
  CORRECTION = 'correction',
}

/** POST /inventory/adjust */
export class InventoryAdjustDto {
  @IsUUID()
  stockItemId!: string;

  @IsUUID()
  locationId!: string;

  @IsInt()
  change!: number;

  @IsEnum(InventoryAdjustReason)
  reason!: InventoryAdjustReason;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;
}
