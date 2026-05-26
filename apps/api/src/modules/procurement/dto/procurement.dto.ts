import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength, ValidateNested } from 'class-validator';
import { PurchaseOrderStatus, SupplierPurchaseOrderStatus } from '../entities';

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
  @IsEmail()
  portalUserEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  portalPassword?: string;

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

  @IsOptional()
  @IsEnum(SupplierPurchaseOrderStatus)
  supplierStatus?: SupplierPurchaseOrderStatus;

  @IsOptional()
  @IsDateString()
  supplierExpectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  supplierNotes?: string;

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

export class SupplierLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class SupplierPasswordResetDto {
  @IsEmail()
  email!: string;
}

export class SupplierUpdatePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class SupplierPurchaseOrderActionDto {
  @IsUUID()
  purchaseOrderId!: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SupplierDeliveryDocumentDto {
  @IsString()
  name!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeBytes?: number;
}

export class SupplierUploadDeliveryDocumentsDto {
  @IsUUID()
  purchaseOrderId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierDeliveryDocumentDto)
  documents!: SupplierDeliveryDocumentDto[];
}

export class SupplierUpdateDeliveryDto {
  @IsUUID()
  purchaseOrderId!: string;

  @IsDateString()
  expectedDeliveryDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SupplierSendMessageDto {
  @IsOptional()
  @IsUUID()
  purchaseOrderId?: string;

  @IsString()
  message!: string;
}

export class SupplierCatalogUpdateDto {
  @IsUUID()
  supplierItemId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  leadTimeDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minOrderQty?: number;

  @IsOptional()
  @IsString()
  sku?: string;
}

export class SupplierProfileUpdateDto {
  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
