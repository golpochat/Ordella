import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { In, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import {
  AssignTenantRegionDto,
  ProvisionRegionDto,
  RegisterEdgeNodeDto,
  StartDeploymentDto,
  UpsertCdnConfigDto,
  UpsertFailoverRuleDto,
  UpsertResidencyPolicyDto,
  UpsertRoutingPolicyDto,
} from '../dto';
import {
  CloudCdnConfigEntity,
  CloudCrossRegionAccessLogEntity,
  CloudDeploymentEntity,
  CloudEdgeNodeEntity,
  CloudEncryptionKeyEntity,
  CloudFailoverRuleEntity,
  CloudMonitoringAlertEntity,
  CloudRegionCapabilityEntity,
  CloudRegionEntity,
  CloudRegionHealthSnapshotEntity,
  CloudReplicationLinkEntity,
  CloudResidencyPolicyEntity,
  CloudRoutingPolicyEntity,
  CloudTenantRegionAssignmentEntity,
} from '../entities';

const SEED_REGIONS = [
  { regionCode: 'us-east-1', displayName: 'US East (N. Virginia)', cloudProvider: 'aws', isPrimary: true },
  { regionCode: 'eu-west-1', displayName: 'EU West (Ireland)', cloudProvider: 'aws', isPrimary: false },
  { regionCode: 'eastus', displayName: 'East US', cloudProvider: 'azure', isPrimary: false },
  { regionCode: 'europe-west1', displayName: 'Europe West 1', cloudProvider: 'gcp', isPrimary: false },
] as const;

const SEED_EDGE_NODES = [
  { nodeKey: 'store-edge-001', nodeType: 'store', displayName: 'Store Edge Node', offlineFirst: true },
  { nodeKey: 'warehouse-edge-001', nodeType: 'warehouse', displayName: 'Warehouse Edge Node', offlineFirst: false },
  { nodeKey: 'iot-micro-001', nodeType: 'iot_micro', displayName: 'IoT Micro-Region', offlineFirst: true },
  { nodeKey: 'pos-cluster-001', nodeType: 'pos_cluster', displayName: 'POS Edge Cluster', offlineFirst: true },
  { nodeKey: 'sync-gateway-001', nodeType: 'sync_gateway', displayName: 'Offline Sync Gateway', offlineFirst: true },
] as const;

@Injectable()
export class CloudPlatformService {
  constructor(
    @InjectRepository(CloudRegionEntity) private readonly regions: Repository<CloudRegionEntity>,
    @InjectRepository(CloudRegionCapabilityEntity)
    private readonly capabilities: Repository<CloudRegionCapabilityEntity>,
    @InjectRepository(CloudTenantRegionAssignmentEntity)
    private readonly assignments: Repository<CloudTenantRegionAssignmentEntity>,
    @InjectRepository(CloudFailoverRuleEntity) private readonly failoverRules: Repository<CloudFailoverRuleEntity>,
    @InjectRepository(CloudReplicationLinkEntity)
    private readonly replicationLinks: Repository<CloudReplicationLinkEntity>,
    @InjectRepository(CloudEdgeNodeEntity) private readonly edgeNodes: Repository<CloudEdgeNodeEntity>,
    @InjectRepository(CloudRoutingPolicyEntity) private readonly routingPolicies: Repository<CloudRoutingPolicyEntity>,
    @InjectRepository(CloudResidencyPolicyEntity)
    private readonly residencyPolicies: Repository<CloudResidencyPolicyEntity>,
    @InjectRepository(CloudDeploymentEntity) private readonly deployments: Repository<CloudDeploymentEntity>,
    @InjectRepository(CloudRegionHealthSnapshotEntity)
    private readonly healthSnapshots: Repository<CloudRegionHealthSnapshotEntity>,
    @InjectRepository(CloudMonitoringAlertEntity)
    private readonly monitoringAlerts: Repository<CloudMonitoringAlertEntity>,
    @InjectRepository(CloudCdnConfigEntity) private readonly cdnConfigs: Repository<CloudCdnConfigEntity>,
    @InjectRepository(CloudEncryptionKeyEntity) private readonly encryptionKeys: Repository<CloudEncryptionKeyEntity>,
    @InjectRepository(CloudCrossRegionAccessLogEntity)
    private readonly crossRegionLogs: Repository<CloudCrossRegionAccessLogEntity>,
    private readonly auditLogs: AuditLogService,
  ) {}

  private readonly ensureDefaultsLocks = new Map<string, Promise<void>>();

  async dashboard(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    const regionRows = await this.regions.find({ where: { tenantId: tenant.tenantId } });
    const [openAlerts, edgeOnline, latestHealth, activeDeployments] = await Promise.all([
      this.monitoringAlerts.count({ where: { tenantId: tenant.tenantId, status: 'open' } }),
      this.edgeNodes.count({ where: { tenantId: tenant.tenantId, status: 'online' } }),
      this.healthSnapshots.find({
        where: { tenantId: tenant.tenantId },
        order: { recordedAt: 'DESC' },
        take: regionRows.length * 2 || 8,
      }),
      this.deployments.count({
        where: { tenantId: tenant.tenantId, status: In(['pending', 'in_progress', 'canary']) },
      }),
    ]);

    const edgeTotal = await this.edgeNodes.count({ where: { tenantId: tenant.tenantId } });
    const latencyHeatmap = this.buildLatencyHeatmap(regionRows, latestHealth);
    const residency = await this.ensureResidencyPolicy(tenant.tenantId);
    const routing = await this.ensureRoutingPolicy(tenant.tenantId);

    return {
      regions: regionRows.length,
      providers: [...new Set(regionRows.map((r) => r.cloudProvider))],
      openAlerts,
      edgeUptimePercent: edgeTotal ? Math.round((edgeOnline / edgeTotal) * 100) : 100,
      activeDeployments,
      latencyHeatmap,
      residency: {
        euOnlyMode: residency.euOnlyMode,
        usOnlyMode: residency.usOnlyMode,
        apacResidency: residency.apacResidency,
        allowedRegions: residency.allowedRegions,
      },
      routing: {
        failoverMode: (routing.failoverRouting as { mode?: string })?.mode ?? 'active_passive',
        storefrontGeo: (routing.storefrontGeoRouting as { enabled?: boolean })?.enabled ?? true,
        posLowLatency: (routing.posLowLatency as { enabled?: boolean })?.enabled ?? true,
      },
      multiCloud: {
        aws: regionRows.filter((r) => r.cloudProvider === 'aws').length,
        azure: regionRows.filter((r) => r.cloudProvider === 'azure').length,
        gcp: regionRows.filter((r) => r.cloudProvider === 'gcp').length,
      },
    };
  }

  async listRegions(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    const rows = await this.regions.find({ where: { tenantId: tenant.tenantId }, order: { displayName: 'ASC' } });
    const caps = await this.capabilities.find({ where: { tenantId: tenant.tenantId } });
    const capByRegion = new Map(caps.map((c) => [c.regionId, c]));
    return rows.map((r) => ({
      ...r,
      capabilities: capByRegion.get(r.id) ?? null,
    }));
  }

  async listAssignments(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.assignments.find({ where: { tenantId: tenant.tenantId }, order: { assignedAt: 'DESC' } });
  }

  async assignRegion(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: AssignTenantRegionDto) {
    await this.ensureDefaults(tenant);
    const region = await this.regions.findOne({ where: { id: dto.regionId, tenantId: tenant.tenantId } });
    if (!region) throw new NotFoundException('Region not found');

    const role = dto.assignmentRole ?? 'primary';
    const existing = await this.assignments.findOne({
      where: { tenantId: tenant.tenantId, regionId: dto.regionId, assignmentRole: role },
    });
    if (existing) {
      existing.workloadTypes = dto.workloadTypes ?? existing.workloadTypes;
      existing.status = 'active';
      return this.assignments.save(existing);
    }

    const row = await this.assignments.save(
      this.assignments.create({
        tenantId: tenant.tenantId,
        regionId: dto.regionId,
        assignmentRole: role,
        workloadTypes: dto.workloadTypes ?? ['api', 'storefront', 'pos'],
        status: 'active',
        assignedAt: new Date(),
        metadata: { assignedBy: user?.id ?? null },
      }),
    );

    await this.recordCrossRegionLog(tenant.tenantId, null, dto.regionId, 'assign_region', 'cloud_region', true, user);
    return row;
  }

  async getResidencyPolicy(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.ensureResidencyPolicy(tenant.tenantId);
  }

  async updateResidencyPolicy(
    tenant: TenantContext,
    user: AuthenticatedUser | undefined,
    dto: UpsertResidencyPolicyDto,
  ) {
    await this.ensureDefaults(tenant);
    const row = await this.ensureResidencyPolicy(tenant.tenantId);
    if (dto.euOnlyMode !== undefined) row.euOnlyMode = dto.euOnlyMode;
    if (dto.usOnlyMode !== undefined) row.usOnlyMode = dto.usOnlyMode;
    if (dto.apacResidency !== undefined) row.apacResidency = dto.apacResidency;
    if (dto.allowedRegions !== undefined) row.allowedRegions = dto.allowedRegions;
    if (dto.enforceStrict !== undefined) row.enforceStrict = dto.enforceStrict;
    if (dto.customPolicy !== undefined) row.customPolicy = dto.customPolicy;

    if (row.euOnlyMode && row.usOnlyMode) {
      throw new BadRequestException('EU-only and US-only modes cannot both be enabled');
    }

    const saved = await this.residencyPolicies.save(row);
    await this.recordCrossRegionLog(tenant.tenantId, null, null, 'update_residency_policy', 'residency', true, user);
    return saved;
  }

  async getRoutingPolicy(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.ensureRoutingPolicy(tenant.tenantId);
  }

  async updateRoutingPolicy(
    tenant: TenantContext,
    user: AuthenticatedUser | undefined,
    dto: UpsertRoutingPolicyDto,
  ) {
    await this.ensureDefaults(tenant);
    const row = await this.ensureRoutingPolicy(tenant.tenantId);
    if (dto.tenantRouting !== undefined) row.tenantRouting = dto.tenantRouting;
    if (dto.storefrontGeoRouting !== undefined) row.storefrontGeoRouting = dto.storefrontGeoRouting;
    if (dto.posLowLatency !== undefined) row.posLowLatency = dto.posLowLatency;
    if (dto.failoverRouting !== undefined) row.failoverRouting = dto.failoverRouting;
    const saved = await this.routingPolicies.save(row);
    await this.recordCrossRegionLog(tenant.tenantId, null, null, 'update_routing_policy', 'routing', true, user);
    return saved;
  }

  async listFailoverRules(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.failoverRules.find({ where: { tenantId: tenant.tenantId } });
  }

  async upsertFailoverRule(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpsertFailoverRuleDto) {
    await this.ensureDefaults(tenant);
    const existing = await this.failoverRules.findOne({
      where: { tenantId: tenant.tenantId, primaryRegionId: dto.primaryRegionId },
    });
    const row =
      existing ??
      this.failoverRules.create({
        tenantId: tenant.tenantId,
        primaryRegionId: dto.primaryRegionId,
        failoverRegionId: dto.failoverRegionId,
      });
    row.failoverRegionId = dto.failoverRegionId;
    row.mode = dto.mode ?? row.mode ?? 'active_passive';
    row.rpoSeconds = dto.rpoSeconds ?? row.rpoSeconds ?? 300;
    row.rtoSeconds = dto.rtoSeconds ?? row.rtoSeconds ?? 900;
    row.autoFailover = dto.autoFailover ?? row.autoFailover ?? true;
    row.status = 'active';
    const saved = await this.failoverRules.save(row);
    await this.recordCrossRegionLog(
      tenant.tenantId,
      dto.primaryRegionId,
      dto.failoverRegionId,
      'upsert_failover_rule',
      'failover',
      true,
      user,
    );
    return saved;
  }

  async listReplicationLinks(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.replicationLinks.find({ where: { tenantId: tenant.tenantId } });
  }

  async listEdgeNodes(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.edgeNodes.find({ where: { tenantId: tenant.tenantId }, order: { nodeType: 'ASC' } });
  }

  async registerEdgeNode(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: RegisterEdgeNodeDto) {
    await this.ensureDefaults(tenant);
    const existing = await this.edgeNodes.findOne({
      where: { tenantId: tenant.tenantId, nodeKey: dto.nodeKey },
    });
    if (existing) throw new BadRequestException('Edge node key already exists');

    const primary = await this.regions.findOne({ where: { tenantId: tenant.tenantId, isPrimary: true } });
    const row = await this.edgeNodes.save(
      this.edgeNodes.create({
        tenantId: tenant.tenantId,
        regionId: dto.regionId ?? primary?.id ?? null,
        nodeKey: dto.nodeKey,
        nodeType: dto.nodeType,
        displayName: dto.displayName ?? dto.nodeKey,
        locationRef: dto.locationRef ?? null,
        offlineFirst: dto.offlineFirst ?? dto.nodeType === 'sync_gateway',
        syncGatewayUri: dto.syncGatewayUri ?? '',
        status: 'online',
        uptimePercent: 100,
        lastSeenAt: new Date(),
        metadata: {},
      }),
    );
    await this.recordCrossRegionLog(tenant.tenantId, row.regionId, null, 'register_edge_node', 'edge', true, user);
    return row;
  }

  async listDeployments(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.deployments.find({
      where: { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async provisionRegion(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: ProvisionRegionDto) {
    return this.startDeployment(tenant, user, {
      regionId: dto.regionId,
      deploymentType: 'provision',
      strategy: 'rolling',
      scalingConfig: dto.scalingConfig,
    });
  }

  async startDeployment(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: StartDeploymentDto) {
    await this.ensureDefaults(tenant);
    const region = await this.regions.findOne({ where: { id: dto.regionId, tenantId: tenant.tenantId } });
    if (!region) throw new NotFoundException('Region not found');

    const deploymentKey = `dep-${dto.deploymentType}-${randomBytes(4).toString('hex')}`;
    const row = await this.deployments.save(
      this.deployments.create({
        tenantId: tenant.tenantId,
        regionId: dto.regionId,
        deploymentKey,
        deploymentType: dto.deploymentType,
        strategy: dto.strategy ?? (dto.deploymentType === 'canary' ? 'canary' : 'rolling'),
        status: 'in_progress',
        version: dto.version ?? 'latest',
        canaryPercent: dto.canaryPercent ?? (dto.deploymentType === 'canary' ? 10 : 0),
        scalingConfig: dto.scalingConfig ?? { minInstances: 2, maxInstances: 10, targetCpu: 70 },
        startedAt: new Date(),
        rollbackOfId: dto.rollbackOfId ?? null,
        metadata: { zeroDowntime: true, initiatedBy: user?.id ?? null },
      }),
    );

    setTimeout(() => void this.completeDeployment(row.id, tenant.tenantId), 50);

    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      actorType: 'admin',
      source: 'cloud_platform',
      action: `cloud_platform.deployment.${dto.deploymentType}`,
      entityType: 'cloud_deployment',
      entityId: row.id,
      userId: user?.id,
      metadata: { deploymentKey, regionCode: region.regionCode, strategy: row.strategy },
      status: 'success',
    });

    return row;
  }

  async rollbackDeployment(tenant: TenantContext, user: AuthenticatedUser | undefined, deploymentId: string) {
    const original = await this.deployments.findOne({
      where: { id: deploymentId, tenantId: tenant.tenantId },
    });
    if (!original) throw new NotFoundException('Deployment not found');
    if (!original.regionId) throw new BadRequestException('Deployment has no region');

    return this.startDeployment(tenant, user, {
      regionId: original.regionId,
      deploymentType: 'rollback',
      strategy: 'rolling',
      version: original.version,
      rollbackOfId: original.id,
    });
  }

  async listMonitoringAlerts(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.monitoringAlerts.find({
      where: { tenantId: tenant.tenantId },
      order: { detectedAt: 'DESC' },
      take: 50,
    });
  }

  async getRegionMetrics(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    const regions = await this.regions.find({ where: { tenantId: tenant.tenantId } });
    const snapshots = await this.healthSnapshots.find({
      where: { tenantId: tenant.tenantId },
      order: { recordedAt: 'DESC' },
      take: regions.length * 3 || 12,
    });
    const latestByRegion = new Map<string, CloudRegionHealthSnapshotEntity>();
    for (const snap of snapshots) {
      if (!latestByRegion.has(snap.regionId)) latestByRegion.set(snap.regionId, snap);
    }
    return regions.map((r) => ({
      regionId: r.id,
      regionCode: r.regionCode,
      displayName: r.displayName,
      cloudProvider: r.cloudProvider,
      metrics: latestByRegion.get(r.id) ?? null,
    }));
  }

  async getCdnConfig(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.ensureCdnConfig(tenant.tenantId);
  }

  async updateCdnConfig(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpsertCdnConfigDto) {
    await this.ensureDefaults(tenant);
    const row = await this.ensureCdnConfig(tenant.tenantId);
    if (dto.storefrontCdn !== undefined) row.storefrontCdn = dto.storefrontCdn;
    if (dto.imageOptimization !== undefined) row.imageOptimization = dto.imageOptimization;
    if (dto.apiEdgeCache !== undefined) row.apiEdgeCache = dto.apiEdgeCache;
    if (dto.staticAssetReplication !== undefined) row.staticAssetReplication = dto.staticAssetReplication;
    return this.cdnConfigs.save(row);
  }

  async listEncryptionKeys(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.encryptionKeys.find({ where: { tenantId: tenant.tenantId } });
  }

  async listCrossRegionAccessLogs(tenant: TenantContext) {
    return this.crossRegionLogs.find({
      where: { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  private async completeDeployment(deploymentId: string, tenantId: string) {
    const row = await this.deployments.findOne({ where: { id: deploymentId, tenantId } });
    if (!row || row.status === 'completed') return;
    row.status = 'completed';
    row.completedAt = new Date();
    await this.deployments.save(row);
  }

  private buildLatencyHeatmap(
    regions: CloudRegionEntity[],
    snapshots: CloudRegionHealthSnapshotEntity[],
  ): Record<string, { p50: number; p99: number; errorRate: number }> {
    const latest = new Map<string, CloudRegionHealthSnapshotEntity>();
    for (const s of snapshots) {
      if (!latest.has(s.regionId)) latest.set(s.regionId, s);
    }
    const heatmap: Record<string, { p50: number; p99: number; errorRate: number }> = {};
    for (const r of regions) {
      const snap = latest.get(r.id);
      heatmap[r.regionCode] = {
        p50: snap?.latencyP50Ms ?? 0,
        p99: snap?.latencyP99Ms ?? 0,
        errorRate: Number(snap?.errorRatePercent ?? 0),
      };
    }
    return heatmap;
  }

  private async recordCrossRegionLog(
    tenantId: string,
    sourceRegionId: string | null,
    targetRegionId: string | null,
    action: string,
    resourceType: string,
    allowed: boolean,
    user?: AuthenticatedUser,
  ) {
    await this.crossRegionLogs.save(
      this.crossRegionLogs.create({
        tenantId,
        sourceRegionId,
        targetRegionId,
        actorType: user ? 'admin' : 'system',
        action,
        resourceType,
        allowed,
        metadata: { userId: user?.id ?? null },
      }),
    );
  }

  private async ensureResidencyPolicy(tenantId: string) {
    const existing = await this.residencyPolicies.findOne({ where: { tenantId } });
    if (existing) return existing;
    return this.residencyPolicies.save(
      this.residencyPolicies.create({
        tenantId,
        euOnlyMode: false,
        usOnlyMode: false,
        apacResidency: false,
        allowedRegions: ['us-east-1', 'eu-west-1'],
        enforceStrict: true,
        customPolicy: {},
      }),
    );
  }

  private async ensureRoutingPolicy(tenantId: string) {
    const existing = await this.routingPolicies.findOne({ where: { tenantId } });
    if (existing) return existing;
    return this.routingPolicies.save(
      this.routingPolicies.create({
        tenantId,
        tenantRouting: { defaultRegion: 'us-east-1', stickySessions: true },
        storefrontGeoRouting: { enabled: true, nearestRegion: true, cacheTtlSeconds: 300 },
        posLowLatency: { enabled: true, maxLatencyMs: 50, preferEdge: true },
        failoverRouting: { mode: 'active_passive', healthCheckIntervalSeconds: 30 },
      }),
    );
  }

  private async ensureCdnConfig(tenantId: string) {
    const existing = await this.cdnConfigs.findOne({ where: { tenantId } });
    if (existing) return existing;
    return this.cdnConfigs.save(
      this.cdnConfigs.create({
        tenantId,
        storefrontCdn: { enabled: true, provider: 'cloudfront', cacheBehaviors: ['static', 'images'] },
        imageOptimization: { webp: true, avif: false, maxWidth: 2048 },
        apiEdgeCache: { enabled: true, ttlSeconds: 60, cacheableRoutes: ['/api/v1/catalog/*'] },
        staticAssetReplication: { regions: ['us-east-1', 'eu-west-1'], syncIntervalMinutes: 15 },
      }),
    );
  }

  private ensureDefaults(tenant: TenantContext): Promise<void> {
    const tenantId = tenant.tenantId;
    const inFlight = this.ensureDefaultsLocks.get(tenantId);
    if (inFlight) return inFlight;

    const run = this.seedDefaults(tenant).finally(() => {
      if (this.ensureDefaultsLocks.get(tenantId) === run) {
        this.ensureDefaultsLocks.delete(tenantId);
      }
    });
    this.ensureDefaultsLocks.set(tenantId, run);
    return run;
  }

  private async seedDefaults(tenant: TenantContext) {
    const tenantId = tenant.tenantId;

    for (const seed of SEED_REGIONS) {
      const existing = await this.regions.findOne({
        where: { tenantId, regionCode: seed.regionCode },
      });
      if (!existing) {
        await this.regions.save(
          this.regions.create({
            tenantId,
            regionCode: seed.regionCode,
            displayName: seed.displayName,
            cloudProvider: seed.cloudProvider,
            isPrimary: seed.isPrimary,
            status: 'active',
            metadata: { provisioned: true },
          }),
        );
      }
    }

    const regionRows = await this.regions.find({ where: { tenantId } });
    const modulesByProvider: Record<string, string[]> = {
      aws: ['pos', 'storefront', 'api', 'warehouse', 'analytics'],
      azure: ['api', 'storefront', 'enterprise'],
      gcp: ['analytics', 'data-lake', 'forecast'],
    };
    const residencyByCode: Record<string, string[]> = {
      'us-east-1': ['US'],
      'eu-west-1': ['EU', 'UK'],
      eastus: ['US'],
      'europe-west1': ['EU'],
    };

    for (const region of regionRows) {
      const capExisting = await this.capabilities.findOne({ where: { tenantId, regionId: region.id } });
      if (!capExisting) {
        await this.capabilities.save(
          this.capabilities.create({
            tenantId,
            regionId: region.id,
            dataResidencyZones: residencyByCode[region.regionCode] ?? ['GLOBAL'],
            latencyClass: region.isPrimary ? 'low' : 'standard',
            supportedModules: modulesByProvider[region.cloudProvider] ?? ['api'],
            maxTenants: 0,
            metadata: { iamIntegration: `${region.cloudProvider}_iam` },
          }),
        );
      }

      const keyExisting = await this.encryptionKeys.findOne({
        where: { tenantId, regionId: region.id, keyAlias: 'tenant-data-key' },
      });
      if (!keyExisting) {
        await this.encryptionKeys.save(
          this.encryptionKeys.create({
            tenantId,
            regionId: region.id,
            keyAlias: 'tenant-data-key',
            provider: region.cloudProvider === 'aws' ? 'aws_kms' : region.cloudProvider === 'azure' ? 'azure_keyvault' : 'gcp_kms',
            rotationDays: 90,
            status: 'active',
            metadata: { isolated: true },
          }),
        );
      }

      const recentHealth = await this.healthSnapshots.findOne({
        where: { tenantId, regionId: region.id },
        order: { recordedAt: 'DESC' },
      });
      if (!recentHealth || Date.now() - recentHealth.recordedAt.getTime() > 3600_000) {
        const baseLatency = region.cloudProvider === 'aws' && region.isPrimary ? 28 : 45;
        await this.healthSnapshots.save(
          this.healthSnapshots.create({
            tenantId,
            regionId: region.id,
            healthStatus: 'healthy',
            latencyP50Ms: baseLatency,
            latencyP99Ms: baseLatency * 3,
            errorRatePercent: 0.1,
            requestCount: 10000 + Math.floor(Math.random() * 5000),
            recordedAt: new Date(),
          }),
        );
      }
    }

    const primary = regionRows.find((r) => r.isPrimary) ?? regionRows[0];
    const secondary = regionRows.find((r) => r.id !== primary?.id);
    if (primary) {
      const assignExisting = await this.assignments.findOne({
        where: { tenantId, regionId: primary.id, assignmentRole: 'primary' },
      });
      if (!assignExisting) {
        await this.assignments.save(
          this.assignments.create({
            tenantId,
            regionId: primary.id,
            assignmentRole: 'primary',
            workloadTypes: ['api', 'storefront', 'pos', 'admin'],
            status: 'active',
            assignedAt: new Date(),
            metadata: {},
          }),
        );
      }
    }

    if (primary && secondary) {
      const failoverExisting = await this.failoverRules.findOne({
        where: { tenantId, primaryRegionId: primary.id },
      });
      if (!failoverExisting) {
        await this.failoverRules.save(
          this.failoverRules.create({
            tenantId,
            primaryRegionId: primary.id,
            failoverRegionId: secondary.id,
            mode: 'active_passive',
            rpoSeconds: 300,
            rtoSeconds: 900,
            autoFailover: true,
            status: 'active',
            metadata: {},
          }),
        );
      }

      const replExisting = await this.replicationLinks.findOne({
        where: { tenantId, sourceRegionId: primary.id, targetRegionId: secondary.id },
      });
      if (!replExisting) {
        await this.replicationLinks.save(
          this.replicationLinks.create({
            tenantId,
            sourceRegionId: primary.id,
            targetRegionId: secondary.id,
            replicationType: 'async',
            lagMs: 120,
            status: 'healthy',
            metadata: { consistentGlobalState: true },
          }),
        );
      }
    }

    const primaryId = primary?.id ?? null;
    for (const seed of SEED_EDGE_NODES) {
      const existing = await this.edgeNodes.findOne({ where: { tenantId, nodeKey: seed.nodeKey } });
      if (!existing) {
        await this.edgeNodes.save(
          this.edgeNodes.create({
            tenantId,
            regionId: primaryId,
            nodeKey: seed.nodeKey,
            nodeType: seed.nodeType,
            displayName: seed.displayName,
            locationRef: null,
            offlineFirst: seed.offlineFirst,
            syncGatewayUri: seed.nodeType === 'sync_gateway' ? `edge://${tenantId}/sync` : '',
            status: 'online',
            uptimePercent: 99.9,
            lastSeenAt: new Date(),
            metadata: {},
          }),
        );
      }
    }

    await this.ensureResidencyPolicy(tenantId);
    await this.ensureRoutingPolicy(tenantId);
    await this.ensureCdnConfig(tenantId);
  }
}
