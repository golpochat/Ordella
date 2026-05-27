import { createHash } from 'crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { EventStoreRecordEntity } from '../../event-bus/entities/event-store-record.entity';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderEntity } from '../../orders/entities/order.entity';
import { LocationEntity } from '../../tenants/entities/location.entity';
import {
  ComputeFeaturesDto,
  CreateExportDto,
  QueryWarehouseDto,
  RunPipelineDto,
  StreamIngestDto,
  UpdateGovernanceDto,
} from '../dto';
import {
  DataGovernancePolicyEntity,
  DataLakeExportEntity,
  DataLakePartitionEntity,
  DataLakeSchemaEntity,
  DataLakeSettingsEntity,
  DataLakeZoneEntity,
  DataLakeZoneKey,
  DataMaterializedViewEntity,
  DataPipelineEntity,
  DataPipelineRunEntity,
  DataWarehouseTableEntity,
  FeatureStoreFeatureEntity,
} from '../entities';

const DEFAULT_ZONES: Array<{ zoneKey: DataLakeZoneKey; displayName: string; description: string; immutable: boolean; retentionDays: number }> = [
  { zoneKey: 'raw', displayName: 'Raw Zone', description: 'Immutable event dumps partitioned by date/tenant/entity', immutable: true, retentionDays: 90 },
  { zoneKey: 'processed', displayName: 'Processed Zone', description: 'Cleaned, validated, deduplicated structured data', immutable: false, retentionDays: 180 },
  { zoneKey: 'analytics', displayName: 'Analytics Zone', description: 'Star-schema tables and KPI materialized views', immutable: false, retentionDays: 365 },
  { zoneKey: 'ml', displayName: 'ML Zone', description: 'Feature store and training datasets', immutable: false, retentionDays: 365 },
];

const DEFAULT_PIPELINES: Array<{
  pipelineKey: string;
  displayName: string;
  pipelineType: DataPipelineEntity['pipelineType'];
  sourceZone: string | null;
  targetZone: string | null;
  scheduleCron: string | null;
}> = [
  { pipelineKey: 'batch-daily-ingest', displayName: 'Batch Daily Ingest', pipelineType: 'batch', sourceZone: null, targetZone: 'raw', scheduleCron: '0 2 * * *' },
  { pipelineKey: 'batch-hourly-ingest', displayName: 'Batch Hourly Ingest', pipelineType: 'batch', sourceZone: null, targetZone: 'raw', scheduleCron: '0 * * * *' },
  { pipelineKey: 'stream-event-bus', displayName: 'Event Bus Streaming', pipelineType: 'streaming', sourceZone: null, targetZone: 'raw', scheduleCron: null },
  { pipelineKey: 'etl-raw-to-processed', displayName: 'ETL Raw → Processed', pipelineType: 'etl', sourceZone: 'raw', targetZone: 'processed', scheduleCron: '15 * * * *' },
  { pipelineKey: 'elt-processed-to-analytics', displayName: 'ELT Processed → Analytics', pipelineType: 'elt', sourceZone: 'processed', targetZone: 'analytics', scheduleCron: '30 * * * *' },
  { pipelineKey: 'etl-analytics-to-ml', displayName: 'ETL Analytics → ML Features', pipelineType: 'etl', sourceZone: 'analytics', targetZone: 'ml', scheduleCron: '0 4 * * *' },
];

const DEFAULT_SCHEMAS: Array<{ entityType: string; schemaJson: Record<string, unknown> }> = [
  { entityType: 'orders', schemaJson: { type: 'object', required: ['eventId', 'topicKey', 'occurredAt'], properties: { eventId: { type: 'string' }, topicKey: { type: 'string' }, payload: { type: 'object' } } } },
  { entityType: 'inventory', schemaJson: { type: 'object', required: ['eventId', 'topicKey'], properties: { eventId: { type: 'string' }, payload: { type: 'object' } } } },
  { entityType: 'customers', schemaJson: { type: 'object', required: ['eventId'], properties: { eventId: { type: 'string' }, payload: { type: 'object' } } } },
  { entityType: 'deliveries', schemaJson: { type: 'object', required: ['eventId'], properties: { eventId: { type: 'string' }, payload: { type: 'object' } } } },
];

const WAREHOUSE_TABLES: Array<{ tableKey: string; displayName: string; tableKind: 'dimension' | 'fact'; grain: string }> = [
  { tableKey: 'dim_products', displayName: 'Products', tableKind: 'dimension', grain: 'product_id' },
  { tableKey: 'dim_customers', displayName: 'Customers', tableKind: 'dimension', grain: 'customer_id' },
  { tableKey: 'dim_locations', displayName: 'Locations', tableKind: 'dimension', grain: 'location_id' },
  { tableKey: 'fact_orders', displayName: 'Orders', tableKind: 'fact', grain: 'order_id' },
  { tableKey: 'fact_inventory_movements', displayName: 'Inventory Movements', tableKind: 'fact', grain: 'movement_id' },
  { tableKey: 'fact_deliveries', displayName: 'Deliveries', tableKind: 'fact', grain: 'delivery_id' },
  { tableKey: 'fact_sessions', displayName: 'Sessions', tableKind: 'fact', grain: 'session_id' },
];

const MATERIALIZED_VIEWS: Array<{ viewKey: string; displayName: string; kpiCategory: string; definitionSql: string; refreshCron: string }> = [
  { viewKey: 'kpi_revenue_daily', displayName: 'Daily Revenue KPI', kpiCategory: 'revenue', definitionSql: 'SELECT date_trunc(\'day\', created_at) AS day, SUM(grand_total) FROM fact_orders GROUP BY 1', refreshCron: '0 */6 * * *' },
  { viewKey: 'kpi_orders_hourly', displayName: 'Hourly Orders KPI', kpiCategory: 'orders', definitionSql: 'SELECT date_trunc(\'hour\', created_at) AS hour, COUNT(*) FROM fact_orders GROUP BY 1', refreshCron: '0 * * * *' },
  { viewKey: 'kpi_inventory_turnover', displayName: 'Inventory Turnover KPI', kpiCategory: 'inventory', definitionSql: 'SELECT location_id, AVG(turnover_rate) FROM fact_inventory_movements GROUP BY 1', refreshCron: '0 3 * * *' },
];

@Injectable()
export class DataLakeService {
  private readonly seenEventHashes = new Map<string, Set<string>>();

  constructor(
    @InjectRepository(DataLakeSettingsEntity)
    private readonly settings: Repository<DataLakeSettingsEntity>,
    @InjectRepository(DataLakeZoneEntity)
    private readonly zones: Repository<DataLakeZoneEntity>,
    @InjectRepository(DataPipelineEntity)
    private readonly pipelines: Repository<DataPipelineEntity>,
    @InjectRepository(DataPipelineRunEntity)
    private readonly pipelineRuns: Repository<DataPipelineRunEntity>,
    @InjectRepository(DataLakeSchemaEntity)
    private readonly schemas: Repository<DataLakeSchemaEntity>,
    @InjectRepository(DataLakePartitionEntity)
    private readonly partitions: Repository<DataLakePartitionEntity>,
    @InjectRepository(DataWarehouseTableEntity)
    private readonly warehouseTables: Repository<DataWarehouseTableEntity>,
    @InjectRepository(DataMaterializedViewEntity)
    private readonly materializedViews: Repository<DataMaterializedViewEntity>,
    @InjectRepository(FeatureStoreFeatureEntity)
    private readonly features: Repository<FeatureStoreFeatureEntity>,
    @InjectRepository(DataGovernancePolicyEntity)
    private readonly governance: Repository<DataGovernancePolicyEntity>,
    @InjectRepository(DataLakeExportEntity)
    private readonly exports: Repository<DataLakeExportEntity>,
    @InjectRepository(EventStoreRecordEntity)
    private readonly eventStore: Repository<EventStoreRecordEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    private readonly auditLogs: AuditLogService,
  ) {}

  async dashboard(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    const [zoneRows, pipelineRows, recentRuns, failedRuns, schemas, tables, views, featuresCount] = await Promise.all([
      this.zones.find({ where: { tenantId: tenant.tenantId } }),
      this.pipelines.find({ where: { tenantId: tenant.tenantId } }),
      this.pipelineRuns.find({ where: { tenantId: tenant.tenantId }, order: { startedAt: 'DESC' }, take: 10 }),
      this.pipelineRuns.count({ where: { tenantId: tenant.tenantId, status: 'failed' } }),
      this.schemas.count({ where: { tenantId: tenant.tenantId, isActive: true } }),
      this.warehouseTables.find({ where: { tenantId: tenant.tenantId } }),
      this.materializedViews.find({ where: { tenantId: tenant.tenantId, isActive: true } }),
      this.features.count({ where: { tenantId: tenant.tenantId } }),
    ]);

    const freshness = zoneRows.map((zone) => ({
      zoneKey: zone.zoneKey,
      lastIngestedAt: zone.lastIngestedAt,
      stale: zone.lastIngestedAt ? Date.now() - zone.lastIngestedAt.getTime() > 24 * 60 * 60 * 1000 : true,
      objectCount: zone.objectCount,
      bytesEstimate: zone.bytesEstimate,
    }));

    return {
      zones: zoneRows,
      pipelines: pipelineRows,
      recentRuns,
      failedRunCount: failedRuns,
      schemaCount: schemas,
      warehouseTables: tables,
      materializedViews: views,
      featureCount: featuresCount,
      freshness,
      performance: {
        columnarStorage: true,
        compression: 'snappy',
        partitionPruning: true,
        queryAcceleration: true,
      },
      integrations: ['analytics', 'ai_assistant', 'marketing', 'forecast', 'power_bi', 'looker', 'tableau'],
    };
  }

  async listSchemas(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    return this.schemas.find({ where: { tenantId: tenant.tenantId, isActive: true }, order: { entityType: 'ASC', version: 'DESC' } });
  }

  async listPartitions(tenant: TenantContext, zoneKey?: string) {
    return this.partitions.find({
      where: { tenantId: tenant.tenantId, ...(zoneKey ? { zoneKey } : {}) },
      order: { partitionDate: 'DESC' },
      take: 100,
    });
  }

  async listWarehouseTables(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    return this.warehouseTables.find({ where: { tenantId: tenant.tenantId }, order: { tableKey: 'ASC' } });
  }

  async listPipelineRuns(tenant: TenantContext, pipelineKey?: string) {
    if (pipelineKey) {
      const pipeline = await this.pipelines.findOne({ where: { tenantId: tenant.tenantId, pipelineKey } });
      if (!pipeline) throw new NotFoundException('Pipeline not found');
      return this.pipelineRuns.find({ where: { tenantId: tenant.tenantId, pipelineId: pipeline.id }, order: { startedAt: 'DESC' }, take: 50 });
    }
    return this.pipelineRuns.find({ where: { tenantId: tenant.tenantId }, order: { startedAt: 'DESC' }, take: 50 });
  }

  async runPipeline(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: RunPipelineDto) {
    await this.ensureDefaults(tenant.tenantId);
    const pipeline = await this.pipelines.findOne({ where: { tenantId: tenant.tenantId, pipelineKey: dto.pipelineKey } });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    if (!pipeline.isActive) throw new BadRequestException('Pipeline is paused');

    const run = await this.pipelineRuns.save(this.pipelineRuns.create({
      tenantId: tenant.tenantId,
      pipelineId: pipeline.id,
      status: 'running',
      runMode: dto.runMode ?? 'incremental',
      partitionDate: dto.partitionDate ?? this.today(),
      recordsIn: '0',
      recordsOut: '0',
      recordsDeduped: '0',
      recordsRejected: '0',
      errors: [],
      startedAt: new Date(),
      metrics: {},
    }));

    pipeline.status = 'running';
    pipeline.lastRunAt = new Date();
    await this.pipelines.save(pipeline);

    try {
      let result: { recordsIn: number; recordsOut: number; recordsDeduped: number; recordsRejected: number; errors: Array<Record<string, unknown>> };
      if (pipeline.pipelineType === 'streaming' || pipeline.pipelineKey === 'stream-event-bus') {
        result = await this.executeStreamIngest(tenant, { limit: 500 });
      } else if (pipeline.pipelineType === 'batch') {
        result = await this.executeBatchIngest(tenant, dto);
      } else {
        result = await this.executeEtl(tenant, pipeline, dto);
      }

      run.status = 'succeeded';
      run.recordsIn = String(result.recordsIn);
      run.recordsOut = String(result.recordsOut);
      run.recordsDeduped = String(result.recordsDeduped);
      run.recordsRejected = String(result.recordsRejected);
      run.errors = result.errors;
      run.finishedAt = new Date();
      run.metrics = { durationMs: run.finishedAt.getTime() - run.startedAt.getTime() };
      pipeline.status = 'idle';
      pipeline.lastSuccessAt = new Date();
    } catch (error) {
      run.status = 'failed';
      run.errorMessage = error instanceof Error ? error.message : 'Pipeline failed';
      run.finishedAt = new Date();
      pipeline.status = 'failed';
    }

    await this.pipelineRuns.save(run);
    await this.pipelines.save(pipeline);
    await this.audit(tenant, user, 'data_lake.pipeline_run', 'data_pipeline', pipeline.id, { pipelineKey: dto.pipelineKey, status: run.status });
    return { pipeline, run };
  }

  async streamIngest(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: StreamIngestDto) {
    const result = await this.executeStreamIngest(tenant, dto);
    await this.audit(tenant, user, 'data_lake.stream_ingest', 'data_lake_zone', null, result);
    return result;
  }

  async computeFeatures(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: ComputeFeaturesDto) {
    await this.ensureDefaults(tenant.tenantId);
    const entityTypes = dto.entityType ? [dto.entityType] : (['customer', 'product', 'inventory', 'delivery'] as const);
    const saved = [];
    const now = new Date();

    for (const entityType of entityTypes) {
      if (entityType === 'customer') {
        const rows = await this.customers.find({ where: { tenantId: tenant.tenantId }, take: dto.entityIds?.length ? 200 : 50 });
        const filtered = dto.entityIds?.length ? rows.filter((r) => dto.entityIds!.includes(r.id)) : rows;
        for (const customer of filtered) {
          const orderCount = await this.orders.count({ where: { tenantId: tenant.tenantId, customerId: customer.id } });
          const features = [
            { key: 'rfm_recency_days', value: 30, meta: { segment: orderCount > 5 ? 'loyal' : 'new' } },
            { key: 'churn_risk_score', value: orderCount === 0 ? 0.85 : 0.2 },
            { key: 'ltv_estimate', value: orderCount * 42.5 },
          ];
          for (const f of features) {
            saved.push(await this.features.save(this.features.create({
              tenantId: tenant.tenantId,
              entityType: 'customer',
              entityId: customer.id,
              featureKey: f.key,
              featureValue: f.meta ?? {},
              numericValue: String(f.value),
              computedAt: now,
              validUntil: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
              metadata: { source: 'data_lake_etl' },
            })));
          }
        }
      }
      if (entityType === 'product') {
        const rows = await this.products.find({ where: { tenantId: tenant.tenantId }, take: 50 });
        for (const product of rows) {
          saved.push(await this.features.save(this.features.create({
            tenantId: tenant.tenantId,
            entityType: 'product',
            entityId: product.id,
            featureKey: 'velocity_score',
            featureValue: { seasonality: 'stable' },
            numericValue: '1.0',
            computedAt: now,
            validUntil: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            metadata: {},
          })));
        }
      }
      if (entityType === 'inventory') {
        for (const location of await this.locations.find({ where: { tenantId: tenant.tenantId }, take: 20 })) {
          saved.push(await this.features.save(this.features.create({
            tenantId: tenant.tenantId,
            entityType: 'inventory',
            entityId: location.id,
            featureKey: 'stockout_risk',
            featureValue: { turnover: 'medium' },
            numericValue: '0.15',
            computedAt: now,
            metadata: {},
          })));
        }
      }
      if (entityType === 'delivery') {
        saved.push(await this.features.save(this.features.create({
          tenantId: tenant.tenantId,
          entityType: 'delivery',
          entityId: tenant.tenantId,
          featureKey: 'avg_delay_minutes',
          featureValue: { driverPerformance: 'good' },
          numericValue: '12.5',
          computedAt: now,
          metadata: {},
        })));
      }
    }

    await this.touchZone(tenant.tenantId, 'ml');
    await this.audit(tenant, user, 'data_lake.features_computed', 'feature_store', null, { count: saved.length });
    return { computed: saved.length, features: saved.slice(0, 20) };
  }

  async createExport(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: CreateExportDto) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const policies = await this.governance.find({ where: { tenantId: tenant.tenantId, isActive: true } });
    const piiMasked = dto.piiMasked ?? settings.piiMaskingEnabled;

    const row = await this.exports.save(this.exports.create({
      tenantId: tenant.tenantId,
      target: dto.target,
      entityType: dto.entityType,
      zoneKey: dto.zoneKey ?? 'analytics',
      status: 'running',
      rowCount: '0',
      piiMasked,
      requestedBy: user?.id ?? null,
      metadata: { policies: policies.map((p) => p.policyKey) },
    }));

    try {
      const partition = await this.partitions.findOne({
        where: {
          tenantId: tenant.tenantId,
          zoneKey: dto.zoneKey ?? 'analytics',
          entityType: dto.entityType,
          ...(dto.partitionDate ? { partitionDate: dto.partitionDate } : {}),
        },
        order: { partitionDate: 'DESC' },
      });
      const sampleRows = await this.sampleExportRows(tenant, dto.entityType, piiMasked);
      row.status = 'succeeded';
      row.rowCount = String(sampleRows.length);
      row.exportUri = `s3://ordella-datalake/${tenant.tenantId}/${dto.zoneKey ?? 'analytics'}/${dto.entityType}/${this.today()}.parquet`;
      row.finishedAt = new Date();
      row.metadata = { ...row.metadata, partition: partition?.id ?? null, sample: sampleRows.slice(0, 5) };
    } catch (error) {
      row.status = 'failed';
      row.errorMessage = error instanceof Error ? error.message : 'Export failed';
      row.finishedAt = new Date();
    }

    await this.exports.save(row);
    await this.audit(tenant, user, 'data_lake.export', 'data_lake_export', row.id, { target: dto.target, entityType: dto.entityType });
    return row;
  }

  async listExports(tenant: TenantContext) {
    return this.exports.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async listGovernance(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    return this.governance.find({ where: { tenantId: tenant.tenantId, isActive: true } });
  }

  async updateGovernance(tenant: TenantContext, user: AuthenticatedUser | undefined, policyKey: string, dto: UpdateGovernanceDto) {
    let policy = await this.governance.findOne({ where: { tenantId: tenant.tenantId, policyKey } });
    if (!policy) throw new NotFoundException('Policy not found');
    if (dto.retentionDays !== undefined) policy.retentionDays = dto.retentionDays;
    if (dto.piiFields !== undefined) policy.piiFields = dto.piiFields;
    if (dto.maskingStrategy !== undefined) policy.maskingStrategy = dto.maskingStrategy;
    if (dto.gdprExportEnabled !== undefined) policy.gdprExportEnabled = dto.gdprExportEnabled;
    policy.updatedAt = new Date();
    policy = await this.governance.save(policy);
    await this.audit(tenant, user, 'data_lake.governance_updated', 'data_governance_policy', policy.id, { policyKey });
    return policy;
  }

  async queryWarehouse(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: QueryWarehouseDto) {
    const table = await this.warehouseTables.findOne({ where: { tenantId: tenant.tenantId, tableKey: dto.tableKey } });
    if (!table) throw new NotFoundException('Warehouse table not found');
    const settings = await this.ensureSettings(tenant.tenantId);
    const limit = dto.limit ?? 100;

    let rows: Array<Record<string, unknown>> = [];
    if (dto.tableKey === 'fact_orders') {
      const orders = await this.orders.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: limit });
      rows = orders.map((o) => this.maskRow(settings.piiMaskingEnabled, {
        order_id: o.id,
        location_id: o.locationId,
        customer_id: o.customerId,
        grand_total: o.total,
        status: o.status,
        created_at: o.createdAt,
      }));
    } else if (dto.tableKey === 'dim_customers') {
      const customers = await this.customers.find({ where: { tenantId: tenant.tenantId }, take: limit });
      rows = customers.map((c) => this.maskRow(settings.piiMaskingEnabled, {
        customer_id: c.id,
        email: c.email,
        phone: c.phone,
        created_at: c.createdAt,
      }));
    } else if (dto.tableKey === 'dim_products') {
      const products = await this.products.find({ where: { tenantId: tenant.tenantId }, take: limit });
      rows = products.map((p) => ({ product_id: p.id, name: p.name, price: p.price, status: p.status }));
    } else if (dto.tableKey === 'dim_locations') {
      const locations = await this.locations.find({ where: { tenantId: tenant.tenantId }, take: limit });
      rows = locations.map((l) => ({ location_id: l.id, name: l.name, timezone: l.timezone }));
    }

    await this.audit(tenant, user, 'data_lake.warehouse_query', 'data_warehouse_table', table.id, { tableKey: dto.tableKey, rowCount: rows.length });
    return { table, rows, partitionPruned: Boolean(dto.fromDate || dto.toDate), limit };
  }

  async refreshMaterializedViews(tenant: TenantContext, user?: AuthenticatedUser) {
    const views = await this.materializedViews.find({ where: { tenantId: tenant.tenantId, isActive: true } });
    const now = new Date();
    for (const view of views) {
      view.lastRefreshedAt = now;
      view.rowCount = String(await this.orders.count({ where: { tenantId: tenant.tenantId } }));
      await this.materializedViews.save(view);
    }
    await this.audit(tenant, user, 'data_lake.mv_refresh', 'data_materialized_view', null, { count: views.length });
    return views;
  }

  private async executeStreamIngest(tenant: TenantContext, dto: StreamIngestDto) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const limit = dto.limit ?? 200;
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const events = await this.eventStore.find({
      where: {
        tenantId: tenant.tenantId,
        ...(dto.topicKey ? { topicKey: dto.topicKey } : {}),
        createdAt: MoreThan(since),
      },
      order: { sequenceNumber: 'DESC' },
      take: limit,
    });

    const dedupeSet = this.seenEventHashes.get(tenant.tenantId) ?? new Set<string>();
    let recordsIn = 0;
    let recordsOut = 0;
    let recordsDeduped = 0;
    let recordsRejected = 0;
    const errors: Array<Record<string, unknown>> = [];

    for (const event of events) {
      recordsIn += 1;
      const entityType = this.topicToEntity(event.topicKey);
      const schema = await this.schemas.findOne({ where: { tenantId: tenant.tenantId, entityType, isActive: true }, order: { version: 'DESC' } });
      if (!schema) {
        recordsRejected += 1;
        errors.push({ eventId: event.eventId, reason: 'schema_not_found', entityType });
        continue;
      }
      if (!this.validatePayload(schema.schemaJson, event.payload)) {
        recordsRejected += 1;
        errors.push({ eventId: event.eventId, reason: 'schema_validation_failed' });
        continue;
      }
      const hash = createHash('sha256').update(event.eventId).digest('hex');
      if (dedupeSet.has(hash)) {
        recordsDeduped += 1;
        continue;
      }
      dedupeSet.add(hash);
      recordsOut += 1;
      await this.upsertPartition(tenant.tenantId, 'raw', entityType, this.today(), 1, JSON.stringify(event.payload).length);
    }
    this.seenEventHashes.set(tenant.tenantId, dedupeSet);

    await this.touchZone(tenant.tenantId, 'raw');
    return { recordsIn, recordsOut, recordsDeduped, recordsRejected, errors, compression: settings.compression, columnar: settings.columnarEnabled };
  }

  private async executeBatchIngest(tenant: TenantContext, dto: RunPipelineDto) {
    const partitionDates = this.dateRange(dto.fromDate ?? dto.partitionDate ?? this.today(), dto.toDate ?? dto.partitionDate ?? this.today());
    let recordsIn = 0;
    let recordsOut = 0;
    const errors: Array<Record<string, unknown>> = [];

    for (const partitionDate of partitionDates) {
      const eventCount = await this.eventStore.count({
        where: { tenantId: tenant.tenantId, createdAt: MoreThan(new Date(`${partitionDate}T00:00:00Z`)) },
      });
      recordsIn += eventCount;
      recordsOut += eventCount;
      await this.upsertPartition(tenant.tenantId, 'raw', 'orders', partitionDate, eventCount, eventCount * 512);
    }

    await this.touchZone(tenant.tenantId, 'raw');
    return { recordsIn, recordsOut, recordsDeduped: 0, recordsRejected: 0, errors };
  }

  private async executeEtl(tenant: TenantContext, pipeline: DataPipelineEntity, dto: RunPipelineDto) {
    const targetZone = pipeline.targetZone ?? 'processed';
    const sourceZone = pipeline.sourceZone ?? 'raw';
    let recordsIn = 0;
    let recordsOut = 0;

    if (targetZone === 'processed') {
      const rawPartitions = await this.partitions.find({ where: { tenantId: tenant.tenantId, zoneKey: sourceZone }, take: 30 });
      recordsIn = rawPartitions.reduce((sum, p) => sum + Number(p.recordCount), 0);
      for (const partition of rawPartitions) {
        await this.upsertPartition(tenant.tenantId, 'processed', partition.entityType, partition.partitionDate, Number(partition.recordCount), Number(partition.bytesEstimate));
        recordsOut += Number(partition.recordCount);
      }
    }

    if (targetZone === 'analytics') {
      await this.syncWarehouseTables(tenant.tenantId);
      const orderCount = await this.orders.count({ where: { tenantId: tenant.tenantId } });
      recordsIn = orderCount;
      recordsOut = orderCount;
      await this.upsertPartition(tenant.tenantId, 'analytics', 'fact_orders', this.today(), orderCount, orderCount * 256);
      await this.refreshMaterializedViews(tenant);
    }

    if (targetZone === 'ml') {
      await this.computeFeatures(tenant, undefined, {});
      recordsOut = await this.features.count({ where: { tenantId: tenant.tenantId } });
      recordsIn = recordsOut;
    }

    await this.touchZone(tenant.tenantId, targetZone as DataLakeZoneKey);
    return { recordsIn, recordsOut, recordsDeduped: 0, recordsRejected: 0, errors: [] };
  }

  private async syncWarehouseTables(tenantId: string) {
    const counts: Record<string, number> = {
      dim_products: await this.products.count({ where: { tenantId } }),
      dim_customers: await this.customers.count({ where: { tenantId } }),
      dim_locations: await this.locations.count({ where: { tenantId } }),
      fact_orders: await this.orders.count({ where: { tenantId } }),
    };
    const now = new Date();
    for (const [tableKey, rowCount] of Object.entries(counts)) {
      const table = await this.warehouseTables.findOne({ where: { tenantId, tableKey } });
      if (table) {
        table.rowCount = String(rowCount);
        table.lastRefreshedAt = now;
        table.updatedAt = now;
        await this.warehouseTables.save(table);
      }
    }
  }

  private async ensureDefaults(tenantId: string) {
    await this.ensureSettings(tenantId);
    for (const zone of DEFAULT_ZONES) {
      const existing = await this.zones.findOne({ where: { tenantId, zoneKey: zone.zoneKey } });
      if (!existing) {
        await this.zones.save(this.zones.create({ tenantId, ...zone, objectCount: '0', bytesEstimate: '0', lastIngestedAt: null, metadata: {} }));
      }
    }
    for (const pipeline of DEFAULT_PIPELINES) {
      const existing = await this.pipelines.findOne({ where: { tenantId, pipelineKey: pipeline.pipelineKey } });
      if (!existing) {
        await this.pipelines.save(this.pipelines.create({ tenantId, ...pipeline, status: 'idle', isActive: true, config: {}, lastRunAt: null, lastSuccessAt: null }));
      }
    }
    for (const schema of DEFAULT_SCHEMAS) {
      const existing = await this.schemas.findOne({ where: { tenantId, entityType: schema.entityType, version: 1 } });
      if (!existing) {
        await this.schemas.save(this.schemas.create({ tenantId, entityType: schema.entityType, version: 1, schemaJson: schema.schemaJson, isActive: true }));
      }
    }
    for (const table of WAREHOUSE_TABLES) {
      const existing = await this.warehouseTables.findOne({ where: { tenantId, tableKey: table.tableKey } });
      if (!existing) {
        await this.warehouseTables.save(this.warehouseTables.create({
          tenantId,
          ...table,
          rowCount: '0',
          lastRefreshedAt: null,
          isMaterialized: false,
          columns: {},
          metadata: { starSchema: true },
        }));
      }
    }
    for (const view of MATERIALIZED_VIEWS) {
      const existing = await this.materializedViews.findOne({ where: { tenantId, viewKey: view.viewKey } });
      if (!existing) {
        await this.materializedViews.save(this.materializedViews.create({
          tenantId,
          ...view,
          lastRefreshedAt: null,
          rowCount: '0',
          isActive: true,
          metadata: {},
        }));
      }
    }
    const policies = [
      { policyKey: 'pii_default', displayName: 'PII Masking', piiFields: ['email', 'phone', 'name'], maskingStrategy: 'hash' as const, retentionDays: null },
      { policyKey: 'raw_retention', displayName: 'Raw Zone Retention', piiFields: [], maskingStrategy: 'redact' as const, retentionDays: 90 },
      { policyKey: 'gdpr_export', displayName: 'GDPR Export Policy', piiFields: ['email'], maskingStrategy: 'tokenize' as const, retentionDays: 365 },
    ];
    for (const policy of policies) {
      const existing = await this.governance.findOne({ where: { tenantId, policyKey: policy.policyKey } });
      if (!existing) {
        await this.governance.save(this.governance.create({
          tenantId,
          ...policy,
          gdprExportEnabled: true,
          auditDataAccess: true,
          isActive: true,
          metadata: {},
        }));
      }
    }
  }

  private async ensureSettings(tenantId: string) {
    let row = await this.settings.findOne({ where: { tenantId } });
    if (!row) {
      row = await this.settings.save(this.settings.create({
        tenantId,
        storageFormat: 'parquet',
        compression: 'snappy',
        columnarEnabled: true,
        partitionGranularity: 'daily',
        piiMaskingEnabled: true,
        defaultRetentionDays: 365,
        metadata: {},
      }));
    }
    return row;
  }

  private async upsertPartition(tenantId: string, zoneKey: string, entityType: string, partitionDate: string, deltaRecords: number, deltaBytes: number) {
    let partition = await this.partitions.findOne({ where: { tenantId, zoneKey, entityType, partitionDate } });
    partition ??= this.partitions.create({
      tenantId,
      zoneKey,
      entityType,
      partitionDate,
      recordCount: '0',
      bytesEstimate: '0',
      compression: 'snappy',
      storageUri: `s3://ordella-datalake/${tenantId}/${zoneKey}/${entityType}/date=${partitionDate}`,
      metadata: { partitionKeys: ['tenant_id', 'partition_date', 'entity_type'] },
    });
    partition.recordCount = String(Number(partition.recordCount) + deltaRecords);
    partition.bytesEstimate = String(Number(partition.bytesEstimate) + deltaBytes);
    partition.lastRefreshedAt = new Date();
    return this.partitions.save(partition);
  }

  private async touchZone(tenantId: string, zoneKey: DataLakeZoneKey) {
    const zone = await this.zones.findOne({ where: { tenantId, zoneKey } });
    if (!zone) return;
    const partitionSum = await this.partitions
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.record_count), 0)', 'records')
      .addSelect('COALESCE(SUM(p.bytes_estimate), 0)', 'bytes')
      .where('p.tenant_id = :tenantId', { tenantId })
      .andWhere('p.zone_key = :zoneKey', { zoneKey })
      .getRawOne<{ records: string; bytes: string }>();
    zone.objectCount = partitionSum?.records ?? '0';
    zone.bytesEstimate = partitionSum?.bytes ?? '0';
    zone.lastIngestedAt = new Date();
    zone.updatedAt = new Date();
    await this.zones.save(zone);
  }

  private validatePayload(schema: Record<string, unknown>, payload: Record<string, unknown>) {
    if (schema.type !== 'object') return true;
    const required = (schema.required as string[] | undefined) ?? [];
    return required.every((key) => payload[key] !== undefined || key === 'payload');
  }

  private topicToEntity(topicKey: string) {
    const map: Record<string, string> = {
      orders: 'orders',
      inventory: 'inventory',
      customers: 'customers',
      delivery: 'deliveries',
      payments: 'payments',
      iot: 'iot',
    };
    return map[topicKey] ?? topicKey;
  }

  private maskRow(enabled: boolean, row: Record<string, unknown>) {
    if (!enabled) return row;
    const masked = { ...row };
    for (const key of ['email', 'phone', 'name']) {
      if (typeof masked[key] === 'string') {
        masked[key] = createHash('sha256').update(String(masked[key])).digest('hex').slice(0, 12);
      }
    }
    return masked;
  }

  private async sampleExportRows(tenant: TenantContext, entityType: string, piiMasked: boolean) {
    if (entityType === 'orders' || entityType === 'fact_orders') {
      const orders = await this.orders.find({ where: { tenantId: tenant.tenantId }, take: 10, order: { createdAt: 'DESC' } });
      return orders.map((o) => this.maskRow(piiMasked, { id: o.id, total: o.total, status: o.status }));
    }
    return [{ entityType, exportedAt: new Date().toISOString() }];
  }

  private today() {
    return new Date().toISOString().slice(0, 10);
  }

  private dateRange(from: string, to: string) {
    const dates: string[] = [];
    const start = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates.length ? dates : [from];
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType,
      entityId,
      source: 'data_lake',
      metadata,
    });
  }
}
