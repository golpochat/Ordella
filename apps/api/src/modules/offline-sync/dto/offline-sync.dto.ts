import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class BindEdgeDeviceDto {
  @IsUUID()
  locationId!: string;

  @IsString()
  deviceFingerprint!: string;

  @IsIn(['pos', 'warehouse', 'delivery', 'kiosk', 'tablet', 'mobile'])
  deviceType!: 'pos' | 'warehouse' | 'delivery' | 'kiosk' | 'tablet' | 'mobile';

  @IsString()
  displayName!: string;

  @IsOptional()
  @IsString()
  storageKeyFingerprint?: string;

  @IsOptional()
  @IsObject()
  capabilities?: Record<string, unknown>;
}

export class OfflineSyncOperationDto {
  @IsString()
  clientMutationId!: string;

  @IsIn(['pos', 'warehouse', 'delivery', 'kiosk'])
  sourceApp!: 'pos' | 'warehouse' | 'delivery' | 'kiosk';

  @IsIn(['order', 'cart', 'payment', 'receipt', 'inventory_adjustment', 'barcode_scan', 'delivery_task', 'promotion_snapshot', 'warehouse_task'])
  entityType!: 'order' | 'cart' | 'payment' | 'receipt' | 'inventory_adjustment' | 'barcode_scan' | 'delivery_task' | 'promotion_snapshot' | 'warehouse_task';

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsIn(['create', 'update', 'delete', 'complete', 'print', 'scan'])
  operationType!: 'create' | 'update' | 'delete' | 'complete' | 'print' | 'scan';

  @IsOptional()
  @IsInt()
  baseRevision?: number;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsString()
  occurredAt!: string;
}

export class PushOfflineSyncDto {
  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfflineSyncOperationDto)
  operations!: OfflineSyncOperationDto[];
}

export class UpdateOfflineLocationSettingDto {
  @IsUUID()
  locationId!: string;

  @IsBoolean()
  offlineModeEnabled!: boolean;

  @IsBoolean()
  allowPosSales!: boolean;

  @IsBoolean()
  allowWarehouseOps!: boolean;

  @IsBoolean()
  allowDeliveryOps!: boolean;

  @IsBoolean()
  allowKioskOrders!: boolean;

  @IsBoolean()
  requireDeviceBinding!: boolean;

  @IsInt()
  @Min(1)
  maxOfflineMinutes!: number;

  @IsInt()
  @Min(1)
  deltaRetentionDays!: number;

  @IsOptional()
  @IsObject()
  policy?: Record<string, unknown>;
}

export class ResolveOfflineConflictDto {
  @IsIn(['client_wins', 'server_wins', 'merged', 'dismissed'])
  outcome!: 'client_wins' | 'server_wins' | 'merged' | 'dismissed';

  @IsOptional()
  @IsObject()
  mergedPayload?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  note?: string;
}
