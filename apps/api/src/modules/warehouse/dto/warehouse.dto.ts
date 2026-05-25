import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import type { WarehousePickTaskStatus, WarehouseZoneType } from '../entities';

const zoneTypes = ['picking', 'storage', 'receiving'] as const;
const pickStatuses = ['pending', 'picking', 'completed'] as const;

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

export class CompletePickTaskDto {
  @IsUUID()
  pickTaskId!: string;
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
