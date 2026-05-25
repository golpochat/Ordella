import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import type { InventorySyncReason } from '../../entities';

const syncReasons = ['transfer', 'adjustment', 'auto-sync', 'sale', 'receiving'] as const;

export class InventorySyncDto {
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @IsOptional()
  @IsUUID()
  fromLocationId?: string;

  @IsOptional()
  @IsUUID()
  toLocationId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsEnum(syncReasons)
  reason?: InventorySyncReason;
}

export class InventorySnapshotDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsString()
  label?: string;
}
