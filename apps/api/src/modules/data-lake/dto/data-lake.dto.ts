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
} from 'class-validator';

export class RunPipelineDto {
  @IsString()
  pipelineKey!: string;

  @IsOptional()
  @IsIn(['incremental', 'backfill', 'full'])
  runMode?: 'incremental' | 'backfill' | 'full';

  @IsOptional()
  @IsString()
  partitionDate?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}

export class StreamIngestDto {
  @IsOptional()
  @IsString()
  topicKey?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CreateExportDto {
  @IsIn(['analytics', 'ai_assistant', 'marketing', 'forecast', 'power_bi', 'looker', 'tableau', 'gdpr'])
  target!: 'analytics' | 'ai_assistant' | 'marketing' | 'forecast' | 'power_bi' | 'looker' | 'tableau' | 'gdpr';

  @IsString()
  entityType!: string;

  @IsOptional()
  @IsIn(['raw', 'processed', 'analytics', 'ml'])
  zoneKey?: 'raw' | 'processed' | 'analytics' | 'ml';

  @IsOptional()
  @IsString()
  partitionDate?: string;

  @IsOptional()
  @IsBoolean()
  piiMasked?: boolean;
}

export class ComputeFeaturesDto {
  @IsOptional()
  @IsIn(['customer', 'product', 'inventory', 'delivery'])
  entityType?: 'customer' | 'product' | 'inventory' | 'delivery';

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  entityIds?: string[];
}

export class UpdateGovernanceDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  retentionDays?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  piiFields?: string[];

  @IsOptional()
  @IsIn(['hash', 'redact', 'tokenize'])
  maskingStrategy?: 'hash' | 'redact' | 'tokenize';

  @IsOptional()
  @IsBoolean()
  gdprExportEnabled?: boolean;
}

export class QueryWarehouseDto {
  @IsString()
  tableKey!: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
