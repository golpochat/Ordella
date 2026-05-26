import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import type { WarehousePickTaskStatus, WarehouseZoneType } from '../entities';

const zoneTypes = ['ambient', 'chilled', 'frozen', 'produce', 'bakery', 'picking', 'storage', 'receiving'] as const;
const pickStatuses = ['pending', 'picking', 'picked', 'completed'] as const;

export class UpsertWarehouseZoneDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  warehouseId!: string;

  @IsString()
  name!: string;

  @IsEnum(zoneTypes)
  type!: WarehouseZoneType;
}

export class UpsertWarehouseBinDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  zoneId!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;
}

export class MoveWarehouseBinItemDto {
  @IsUUID()
  fromBinId!: string;

  @IsUUID()
  toBinId!: string;

  @IsUUID()
  itemId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity!: number;
}

export class AssignWarehouseBinItemDto {
  @IsUUID()
  binId!: string;

  @IsUUID()
  itemId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity!: number;
}

export class PickTaskLineConfirmationDto {
  @IsUUID()
  productId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantityPicked!: number;

  @IsOptional()
  @IsUUID()
  substituteProductId?: string;
}

export class CompletePickTaskDto {
  @IsUUID()
  pickTaskId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickTaskLineConfirmationDto)
  lines?: PickTaskLineConfirmationDto[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  missingItemIds?: string[];
}

export class UpdatePickTaskDto {
  @IsUUID()
  pickTaskId!: string;

  @IsEnum(pickStatuses)
  status!: WarehousePickTaskStatus;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
