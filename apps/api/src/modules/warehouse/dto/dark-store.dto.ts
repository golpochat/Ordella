import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class DarkStoreOrdersQueryDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;
}

export class CreateDarkStorePickTaskDto {
  @IsUUID()
  orderId!: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsUUID()
  pickerId?: string;
}

export class CompleteDarkStorePickTaskDto {
  @IsUUID()
  pickTaskId!: string;

  @IsOptional()
  @IsArray()
  missingItemIds?: string[];
}

export class CreatePickWaveDto {
  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsUUID()
  pickerId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  pickTaskIds?: string[];
}

export class FulfillmentSlotsQueryDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
