import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PurchaseOrderStatus } from '../entities';

export class SupplierItemDto {
  @IsUUID()
  itemId!: string;

  @IsNumber()
  @Min(0)
  costPrice!: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  leadTimeDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minOrderQty?: number;
}

export class UpsertSupplierDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierItemDto)
  items?: SupplierItemDto[];
}

export class PurchaseOrderLineDto {
  @IsUUID()
  itemId!: string;

  @IsInt()
  @Min(1)
  quantityOrdered!: number;

  @IsNumber()
  @Min(0)
  costPrice!: number;
}

export class UpsertPurchaseOrderDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  supplierId!: string;

  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineDto)
  items!: PurchaseOrderLineDto[];
}

export class ReceivePurchaseOrderDto {
  @IsUUID()
  purchaseOrderId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivePurchaseOrderLineDto)
  items!: ReceivePurchaseOrderLineDto[];
}

export class ReceivePurchaseOrderLineDto {
  @IsUUID()
  purchaseOrderItemId!: string;

  @IsInt()
  @Min(0)
  quantityReceived!: number;
}
