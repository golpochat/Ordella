import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AssignTenantRegionDto {
  @IsUUID()
  regionId!: string;

  @IsOptional()
  @IsIn(['primary', 'secondary', 'failover', 'edge'])
  assignmentRole?: string;

  @IsOptional()
  @IsArray()
  workloadTypes?: string[];
}

export class UpsertResidencyPolicyDto {
  @IsOptional()
  @IsBoolean()
  euOnlyMode?: boolean;

  @IsOptional()
  @IsBoolean()
  usOnlyMode?: boolean;

  @IsOptional()
  @IsBoolean()
  apacResidency?: boolean;

  @IsOptional()
  @IsArray()
  allowedRegions?: string[];

  @IsOptional()
  @IsBoolean()
  enforceStrict?: boolean;

  @IsOptional()
  @IsObject()
  customPolicy?: Record<string, unknown>;
}

export class UpsertRoutingPolicyDto {
  @IsOptional()
  @IsObject()
  tenantRouting?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  storefrontGeoRouting?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  posLowLatency?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  failoverRouting?: Record<string, unknown>;
}

export class UpsertFailoverRuleDto {
  @IsUUID()
  primaryRegionId!: string;

  @IsUUID()
  failoverRegionId!: string;

  @IsOptional()
  @IsIn(['active_active', 'active_passive'])
  mode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  rpoSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rtoSeconds?: number;

  @IsOptional()
  @IsBoolean()
  autoFailover?: boolean;
}

export class RegisterEdgeNodeDto {
  @IsString()
  nodeKey!: string;

  @IsIn(['store', 'warehouse', 'iot_micro', 'pos_cluster', 'sync_gateway'])
  nodeType!: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  locationRef?: string;

  @IsOptional()
  @IsBoolean()
  offlineFirst?: boolean;

  @IsOptional()
  @IsString()
  syncGatewayUri?: string;
}

export class ProvisionRegionDto {
  @IsUUID()
  regionId!: string;

  @IsOptional()
  @IsObject()
  scalingConfig?: Record<string, unknown>;
}

export class StartDeploymentDto {
  @IsUUID()
  regionId!: string;

  @IsIn(['provision', 'scale', 'blue_green', 'canary', 'rollback'])
  deploymentType!: string;

  @IsOptional()
  @IsIn(['rolling', 'blue_green', 'canary'])
  strategy?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  canaryPercent?: number;

  @IsOptional()
  @IsObject()
  scalingConfig?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  rollbackOfId?: string;
}

export class UpsertCdnConfigDto {
  @IsOptional()
  @IsObject()
  storefrontCdn?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  imageOptimization?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  apiEdgeCache?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  staticAssetReplication?: Record<string, unknown>;
}
