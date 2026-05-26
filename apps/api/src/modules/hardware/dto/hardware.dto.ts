import { IsBoolean, IsIn, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { HardwareDeviceType } from '../entities';

export class HardwareDeviceQueryDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class RegisterHardwareDeviceDto {
  @IsString()
  deviceId!: string;

  @IsUUID()
  locationId!: string;

  @IsIn([
    'receipt_printer',
    'label_printer',
    'barcode_scanner',
    'scale',
    'cash_drawer',
    'kiosk',
    'kds_screen',
    'temperature_sensor',
    'humidity_sensor',
    'door_sensor',
    'shelf_weight_sensor',
  ])
  deviceType!: HardwareDeviceType;

  @IsString()
  displayName!: string;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsBoolean()
  supportsEncryption?: boolean;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  capabilities?: Record<string, unknown>;
}

export class UpdateHardwareDeviceDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  status?: 'online' | 'offline' | 'error';

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class DeviceHeartbeatDto {
  @IsString()
  deviceId!: string;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;
}

export class DispatchDeviceCommandDto {
  @IsString()
  commandType!: 'print_receipt' | 'print_label' | 'open_cash_drawer' | 'scan_barcode' | 'read_weight' | 'kiosk_refresh' | 'firmware_update' | 'ping';

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class AckDeviceCommandDto {
  @IsString()
  status!: 'acknowledged' | 'failed';

  @IsOptional()
  @IsObject()
  responsePayload?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class IngestDeviceEventDto {
  @IsString()
  deviceId!: string;

  @IsString()
  eventType!: 'barcode_scanned' | 'weight_reading' | 'temperature_alert' | 'humidity_alert' | 'door_open' | 'shelf_weight_changed' | 'kiosk_event' | 'printer_status' | 'error';

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
