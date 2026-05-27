import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cloud_regions')
@Index(['tenantId', 'regionCode'], { unique: true })
export class CloudRegionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'region_code', type: 'varchar', length: 64 })
  regionCode!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ name: 'cloud_provider', type: 'varchar', length: 32, default: 'aws' })
  cloudProvider!: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('cloud_region_capabilities')
@Index(['tenantId', 'regionId'], { unique: true })
export class CloudRegionCapabilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'region_id', type: 'uuid' })
  regionId!: string;

  @Column({ name: 'data_residency_zones', type: 'jsonb', default: [] })
  dataResidencyZones!: unknown[];

  @Column({ name: 'latency_class', type: 'varchar', length: 32, default: 'standard' })
  latencyClass!: string;

  @Column({ name: 'supported_modules', type: 'jsonb', default: [] })
  supportedModules!: unknown[];

  @Column({ name: 'max_tenants', type: 'int', default: 0 })
  maxTenants!: number;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('cloud_tenant_region_assignments')
@Index(['tenantId', 'regionId', 'assignmentRole'], { unique: true })
export class CloudTenantRegionAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'region_id', type: 'uuid' })
  regionId!: string;

  @Column({ name: 'assignment_role', type: 'varchar', length: 32, default: 'primary' })
  assignmentRole!: string;

  @Column({ name: 'workload_types', type: 'jsonb', default: [] })
  workloadTypes!: unknown[];

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ name: 'assigned_at', type: 'timestamptz', default: () => 'NOW()' })
  assignedAt!: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;
}

@Entity('cloud_failover_rules')
export class CloudFailoverRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'primary_region_id', type: 'uuid' })
  primaryRegionId!: string;

  @Column({ name: 'failover_region_id', type: 'uuid' })
  failoverRegionId!: string;

  @Column({ type: 'varchar', length: 32, default: 'active_passive' })
  mode!: string;

  @Column({ name: 'rpo_seconds', type: 'int', default: 300 })
  rpoSeconds!: number;

  @Column({ name: 'rto_seconds', type: 'int', default: 900 })
  rtoSeconds!: number;

  @Column({ name: 'auto_failover', type: 'boolean', default: true })
  autoFailover!: boolean;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('cloud_replication_links')
@Index(['tenantId', 'sourceRegionId', 'targetRegionId'], { unique: true })
export class CloudReplicationLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'source_region_id', type: 'uuid' })
  sourceRegionId!: string;

  @Column({ name: 'target_region_id', type: 'uuid' })
  targetRegionId!: string;

  @Column({ name: 'replication_type', type: 'varchar', length: 32, default: 'async' })
  replicationType!: string;

  @Column({ name: 'lag_ms', type: 'int', default: 0 })
  lagMs!: number;

  @Column({ type: 'varchar', length: 32, default: 'healthy' })
  status!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('cloud_edge_nodes')
@Index(['tenantId', 'nodeKey'], { unique: true })
export class CloudEdgeNodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId!: string | null;

  @Column({ name: 'node_key', type: 'varchar', length: 96 })
  nodeKey!: string;

  @Column({ name: 'node_type', type: 'varchar', length: 64 })
  nodeType!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255, default: '' })
  displayName!: string;

  @Column({ name: 'location_ref', type: 'varchar', length: 128, nullable: true })
  locationRef!: string | null;

  @Column({ name: 'offline_first', type: 'boolean', default: false })
  offlineFirst!: boolean;

  @Column({ name: 'sync_gateway_uri', type: 'varchar', length: 512, default: '' })
  syncGatewayUri!: string;

  @Column({ type: 'varchar', length: 32, default: 'online' })
  status!: string;

  @Column({ name: 'uptime_percent', type: 'decimal', precision: 5, scale: 2, default: 100 })
  uptimePercent!: number;

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('cloud_routing_policies')
export class CloudRoutingPolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId!: string;

  @Column({ name: 'tenant_routing', type: 'jsonb', default: {} })
  tenantRouting!: Record<string, unknown>;

  @Column({ name: 'storefront_geo_routing', type: 'jsonb', default: {} })
  storefrontGeoRouting!: Record<string, unknown>;

  @Column({ name: 'pos_low_latency', type: 'jsonb', default: {} })
  posLowLatency!: Record<string, unknown>;

  @Column({ name: 'failover_routing', type: 'jsonb', default: {} })
  failoverRouting!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('cloud_residency_policies')
export class CloudResidencyPolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId!: string;

  @Column({ name: 'eu_only_mode', type: 'boolean', default: false })
  euOnlyMode!: boolean;

  @Column({ name: 'us_only_mode', type: 'boolean', default: false })
  usOnlyMode!: boolean;

  @Column({ name: 'apac_residency', type: 'boolean', default: false })
  apacResidency!: boolean;

  @Column({ name: 'allowed_regions', type: 'jsonb', default: [] })
  allowedRegions!: unknown[];

  @Column({ name: 'enforce_strict', type: 'boolean', default: true })
  enforceStrict!: boolean;

  @Column({ name: 'custom_policy', type: 'jsonb', default: {} })
  customPolicy!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('cloud_deployments')
@Index(['tenantId', 'deploymentKey'], { unique: true })
export class CloudDeploymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId!: string | null;

  @Column({ name: 'deployment_key', type: 'varchar', length: 96 })
  deploymentKey!: string;

  @Column({ name: 'deployment_type', type: 'varchar', length: 64, default: 'provision' })
  deploymentType!: string;

  @Column({ type: 'varchar', length: 32, default: 'rolling' })
  strategy!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', length: 64, default: '' })
  version!: string;

  @Column({ name: 'canary_percent', type: 'int', default: 0 })
  canaryPercent!: number;

  @Column({ name: 'scaling_config', type: 'jsonb', default: {} })
  scalingConfig!: Record<string, unknown>;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'rollback_of_id', type: 'uuid', nullable: true })
  rollbackOfId!: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('cloud_region_health_snapshots')
export class CloudRegionHealthSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'region_id', type: 'uuid' })
  regionId!: string;

  @Column({ name: 'health_status', type: 'varchar', length: 32, default: 'healthy' })
  healthStatus!: string;

  @Column({ name: 'latency_p50_ms', type: 'int', default: 0 })
  latencyP50Ms!: number;

  @Column({ name: 'latency_p99_ms', type: 'int', default: 0 })
  latencyP99Ms!: number;

  @Column({ name: 'error_rate_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  errorRatePercent!: number;

  @Column({ name: 'request_count', type: 'bigint', default: 0 })
  requestCount!: number;

  @Column({ name: 'recorded_at', type: 'timestamptz', default: () => 'NOW()' })
  recordedAt!: Date;
}

@Entity('cloud_monitoring_alerts')
export class CloudMonitoringAlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'alert_type', type: 'varchar', length: 64 })
  alertType!: string;

  @Column({ type: 'varchar', length: 32, default: 'medium' })
  severity!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'open' })
  status!: string;

  @Column({ type: 'varchar', length: 64, default: 'platform' })
  source!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ name: 'detected_at', type: 'timestamptz', default: () => 'NOW()' })
  detectedAt!: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;
}

@Entity('cloud_cdn_configs')
export class CloudCdnConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId!: string;

  @Column({ name: 'storefront_cdn', type: 'jsonb', default: {} })
  storefrontCdn!: Record<string, unknown>;

  @Column({ name: 'image_optimization', type: 'jsonb', default: {} })
  imageOptimization!: Record<string, unknown>;

  @Column({ name: 'api_edge_cache', type: 'jsonb', default: {} })
  apiEdgeCache!: Record<string, unknown>;

  @Column({ name: 'static_asset_replication', type: 'jsonb', default: {} })
  staticAssetReplication!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('cloud_encryption_keys')
@Index(['tenantId', 'regionId', 'keyAlias'], { unique: true })
export class CloudEncryptionKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'region_id', type: 'uuid' })
  regionId!: string;

  @Column({ name: 'key_alias', type: 'varchar', length: 128 })
  keyAlias!: string;

  @Column({ type: 'varchar', length: 32, default: 'aws_kms' })
  provider!: string;

  @Column({ name: 'rotation_days', type: 'int', default: 90 })
  rotationDays!: number;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('cloud_cross_region_access_logs')
export class CloudCrossRegionAccessLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'source_region_id', type: 'uuid', nullable: true })
  sourceRegionId!: string | null;

  @Column({ name: 'target_region_id', type: 'uuid', nullable: true })
  targetRegionId!: string | null;

  @Column({ name: 'actor_type', type: 'varchar', length: 64, default: 'system' })
  actorType!: string;

  @Column({ type: 'varchar', length: 128 })
  action!: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 64 })
  resourceType!: string;

  @Column({ type: 'boolean', default: true })
  allowed!: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

export const CLOUD_PLATFORM_ENTITIES = [
  CloudRegionEntity,
  CloudRegionCapabilityEntity,
  CloudTenantRegionAssignmentEntity,
  CloudFailoverRuleEntity,
  CloudReplicationLinkEntity,
  CloudEdgeNodeEntity,
  CloudRoutingPolicyEntity,
  CloudResidencyPolicyEntity,
  CloudDeploymentEntity,
  CloudRegionHealthSnapshotEntity,
  CloudMonitoringAlertEntity,
  CloudCdnConfigEntity,
  CloudEncryptionKeyEntity,
  CloudCrossRegionAccessLogEntity,
];
