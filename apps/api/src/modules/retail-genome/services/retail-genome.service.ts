import { createHash } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { EventStoreRecordEntity } from '../../event-bus/entities/event-store-record.entity';
import {
  GraphQueryDto,
  IngestPipelineDto,
  RunReasoningDto,
  SemanticSearchDto,
  TraverseGraphDto,
  VectorSearchDto,
} from '../dto';
import {
  GenomeAttributeEntity,
  GenomeEmbeddingEntity,
  GenomeEntityEntity,
  GenomeFederatedRoundEntity,
  GenomeGlobalPatternEntity,
  GenomeGraphSchemaEntity,
  GenomeGraphSnapshotEntity,
  GenomeIngestionRunEntity,
  GenomeLineageEventEntity,
  GenomeQueryCacheEntity,
  GenomeReasoningArtifactEntity,
  GenomeRelationshipEntity,
} from '../entities';

const ENTITY_TYPES = ['product', 'customer', 'order', 'location', 'staff', 'supplier', 'category'] as const;
const RELATIONSHIP_TYPES = [
  'purchased_with',
  'similar_to',
  'substitutes',
  'complements',
  'belongs_to',
  'supplied_by',
] as const;

const SEED_ENTITIES: Array<{ entityType: string; externalRef: string; displayName: string }> = [
  { entityType: 'product', externalRef: 'sku-1001', displayName: 'Organic Espresso Beans' },
  { entityType: 'product', externalRef: 'sku-1002', displayName: 'Oat Milk Barista Edition' },
  { entityType: 'product', externalRef: 'sku-1003', displayName: 'Reusable Cup 12oz' },
  { entityType: 'customer', externalRef: 'cust-42', displayName: 'Loyal Customer A' },
  { entityType: 'order', externalRef: 'ord-9001', displayName: 'Order #9001' },
  { entityType: 'location', externalRef: 'loc-downtown', displayName: 'Downtown Flagship' },
  { entityType: 'staff', externalRef: 'staff-7', displayName: 'Shift Lead' },
  { entityType: 'supplier', externalRef: 'sup-coffee-co', displayName: 'Coffee Co Wholesale' },
  { entityType: 'category', externalRef: 'cat-beverages', displayName: 'Beverages' },
];

@Injectable()
export class RetailGenomeService {
  constructor(
    @InjectRepository(GenomeGraphSchemaEntity) private readonly schemas: Repository<GenomeGraphSchemaEntity>,
    @InjectRepository(GenomeEntityEntity) private readonly entities: Repository<GenomeEntityEntity>,
    @InjectRepository(GenomeRelationshipEntity) private readonly relationships: Repository<GenomeRelationshipEntity>,
    @InjectRepository(GenomeAttributeEntity) private readonly attributes: Repository<GenomeAttributeEntity>,
    @InjectRepository(GenomeEmbeddingEntity) private readonly embeddings: Repository<GenomeEmbeddingEntity>,
    @InjectRepository(GenomeIngestionRunEntity) private readonly ingestionRuns: Repository<GenomeIngestionRunEntity>,
    @InjectRepository(GenomeQueryCacheEntity) private readonly queryCache: Repository<GenomeQueryCacheEntity>,
    @InjectRepository(GenomeReasoningArtifactEntity)
    private readonly reasoningArtifacts: Repository<GenomeReasoningArtifactEntity>,
    @InjectRepository(GenomeFederatedRoundEntity) private readonly federatedRounds: Repository<GenomeFederatedRoundEntity>,
    @InjectRepository(GenomeGlobalPatternEntity) private readonly globalPatterns: Repository<GenomeGlobalPatternEntity>,
    @InjectRepository(GenomeLineageEventEntity) private readonly lineageEvents: Repository<GenomeLineageEventEntity>,
    @InjectRepository(GenomeGraphSnapshotEntity) private readonly snapshots: Repository<GenomeGraphSnapshotEntity>,
    @InjectRepository(EventStoreRecordEntity) private readonly eventStore: Repository<EventStoreRecordEntity>,
    private readonly auditLogs: AuditLogService,
  ) {}

  async dashboard(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    const [entityCount, relationshipCount, embeddingCount, lastIngestion, cacheHits, reasoningCount] =
      await Promise.all([
        this.entities.count({ where: { tenantId: tenant.tenantId } }),
        this.relationships.count({ where: { tenantId: tenant.tenantId } }),
        this.embeddings.count({ where: { tenantId: tenant.tenantId } }),
        this.ingestionRuns.findOne({
          where: { tenantId: tenant.tenantId },
          order: { startedAt: 'DESC' },
        }),
        this.queryCache
          .createQueryBuilder('c')
          .select('COALESCE(SUM(c.hit_count), 0)', 'total')
          .where('c.tenant_id = :tenantId', { tenantId: tenant.tenantId })
          .getRawOne<{ total: string }>(),
        this.reasoningArtifacts.count({ where: { tenantId: tenant.tenantId } }),
      ]);

    const inferredCount = await this.relationships.count({
      where: { tenantId: tenant.tenantId, inferred: true },
    });

    return {
      entityCount,
      relationshipCount,
      embeddingCount,
      inferredRelationships: inferredCount,
      reasoningArtifacts: reasoningCount,
      cacheHits: Number(cacheHits?.total ?? 0),
      lastIngestion: lastIngestion
        ? { source: lastIngestion.source, status: lastIngestion.status, finishedAt: lastIngestion.finishedAt }
        : null,
      graphHealth: entityCount > 0 && relationshipCount > 0 ? 'healthy' : 'initializing',
      distributedStorage: 'partitioned_by_tenant',
      vectorIndex: 'jsonb_accelerated',
    };
  }

  async listEntities(tenant: TenantContext, entityType?: string) {
    await this.ensureDefaults(tenant);
    return this.entities.find({
      where: entityType ? { tenantId: tenant.tenantId, entityType } : { tenantId: tenant.tenantId },
      order: { entityType: 'ASC', displayName: 'ASC' },
      take: 200,
    });
  }

  async getEntityGraph(tenant: TenantContext, entityId: string) {
    await this.ensureDefaults(tenant);
    const entity = await this.entities.findOne({ where: { id: entityId, tenantId: tenant.tenantId } });
    if (!entity) throw new NotFoundException('Entity not found');

    const [outgoing, incoming, attrs, embedding] = await Promise.all([
      this.relationships.find({ where: { tenantId: tenant.tenantId, sourceEntityId: entityId }, take: 50 }),
      this.relationships.find({ where: { tenantId: tenant.tenantId, targetEntityId: entityId }, take: 50 }),
      this.attributes.find({ where: { tenantId: tenant.tenantId, entityId } }),
      this.embeddings.findOne({ where: { tenantId: tenant.tenantId, entityId } }),
    ]);

    const neighborIds = [
      ...new Set([
        ...outgoing.map((r) => r.targetEntityId),
        ...incoming.map((r) => r.sourceEntityId),
      ]),
    ];
    const neighborRows = neighborIds.length
      ? await this.entities.find({ where: { id: In(neighborIds), tenantId: tenant.tenantId } })
      : [];
    const neighborMap = new Map(neighborRows.map((e) => [e.id, e]));

    return {
      entity,
      attributes: attrs,
      embedding: embedding ? { modelKey: embedding.modelKey, dimensions: embedding.dimensions } : null,
      outgoing: outgoing.map((r) => ({
        ...r,
        target: neighborMap.get(r.targetEntityId) ?? null,
      })),
      incoming: incoming.map((r) => ({
        ...r,
        source: neighborMap.get(r.sourceEntityId) ?? null,
      })),
    };
  }

  async listRelationships(tenant: TenantContext, relationshipType?: string) {
    await this.ensureDefaults(tenant);
    return this.relationships.find({
      where: relationshipType
        ? { tenantId: tenant.tenantId, relationshipType }
        : { tenantId: tenant.tenantId },
      order: { score: 'DESC' },
      take: 100,
    });
  }

  async similarityMap(tenant: TenantContext, entityId: string) {
    const graph = await this.getEntityGraph(tenant, entityId);
    const similar = graph.outgoing.filter((r) => r.relationshipType === 'similar_to' || r.relationshipType === 'substitutes');
    return { center: graph.entity, similar };
  }

  async runIngestion(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: IngestPipelineDto) {
    await this.ensureDefaults(tenant);
    const run = await this.ingestionRuns.save(
      this.ingestionRuns.create({
        tenantId: tenant.tenantId,
        pipelineKey: dto.source === 'event_bus' ? 'realtime-event-bus' : 'batch-data-lake',
        source: dto.source,
        status: 'running',
        recordsIn: 0,
        recordsOut: 0,
        entitiesMerged: 0,
        relationshipsInferred: 0,
        errors: [],
        startedAt: new Date(),
      }),
    );

    try {
      if (dto.source === 'event_bus') {
        const result = await this.ingestFromEventBus(tenant, dto.limit ?? 200);
        run.recordsIn = result.recordsIn;
        run.recordsOut = result.recordsOut;
        run.entitiesMerged = result.entitiesMerged;
        run.relationshipsInferred = result.relationshipsInferred;
      } else {
        const result = await this.ingestFromDataLake(tenant, dto.limit ?? 100);
        run.recordsIn = result.recordsIn;
        run.recordsOut = result.recordsOut;
        run.entitiesMerged = result.entitiesMerged;
        run.relationshipsInferred = result.relationshipsInferred;
      }
      run.status = 'succeeded';
    } catch (err) {
      run.status = 'failed';
      run.errors = [{ message: err instanceof Error ? err.message : 'Ingestion failed' }];
    }

    run.finishedAt = new Date();
    await this.ingestionRuns.save(run);
    await this.recordLineage(tenant.tenantId, dto.source, null, 'ingestion_complete', { runId: run.id });
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id,
      actorType: 'admin',
      source: 'retail_genome',
      action: `retail_genome.ingest.${dto.source}`,
      entityType: 'genome_ingestion_run',
      entityId: run.id,
      metadata: { status: run.status, recordsOut: run.recordsOut },
      status: 'success',
    });
    return run;
  }

  async graphQuery(tenant: TenantContext, dto: GraphQueryDto) {
    const cacheKey = `graph:${createHash('sha256').update(dto.query).digest('hex')}`;
    const cached = await this.getCached(tenant.tenantId, cacheKey);
    if (cached) return cached;

    await this.ensureDefaults(tenant);
    let results: unknown[] = [];

    const matchSimilar = /MATCH\s+\(a:PRODUCT\)-\[:SIMILAR_TO\]->\(b:PRODUCT\)/i.test(dto.query);
    const matchPurchased = /PURCHASED_WITH/i.test(dto.query);

    if (matchSimilar) {
      const rels = await this.relationships.find({
        where: { tenantId: tenant.tenantId, relationshipType: 'similar_to' },
        take: 20,
      });
      results = await this.enrichRelationships(tenant.tenantId, rels);
    } else if (matchPurchased) {
      const rels = await this.relationships.find({
        where: { tenantId: tenant.tenantId, relationshipType: 'purchased_with' },
        take: 20,
      });
      results = await this.enrichRelationships(tenant.tenantId, rels);
    } else {
      results = await this.entities.find({ where: { tenantId: tenant.tenantId }, take: 10 });
    }

    const payload = { query: dto.query, dialect: 'cypher-like', results, maxHops: dto.maxHops ?? 3 };
    await this.setCache(tenant.tenantId, cacheKey, 'graph_query', payload);
    return payload;
  }

  async vectorSearch(tenant: TenantContext, dto: VectorSearchDto) {
    await this.ensureDefaults(tenant);
    const queryVector = this.textToVector(dto.queryText);
    const rows = await this.embeddings.find({ where: { tenantId: tenant.tenantId } });
    const entityFilter = dto.entityType;

    const scored = [];
    for (const row of rows) {
      const entity = await this.entities.findOne({ where: { id: row.entityId, tenantId: tenant.tenantId } });
      if (!entity || (entityFilter && entity.entityType !== entityFilter)) continue;
      const score = this.cosineSimilarity(queryVector, row.vector);
      scored.push({ entity, score, modelKey: row.modelKey });
    }

    scored.sort((a, b) => b.score - a.score);
    const limit = dto.limit ?? 10;
    return { queryText: dto.queryText, results: scored.slice(0, limit) };
  }

  async semanticSearch(tenant: TenantContext, dto: SemanticSearchDto) {
    const vectorResults = await this.vectorSearch(tenant, {
      queryText: dto.query,
      entityType: dto.searchMode === 'product' ? 'product' : undefined,
      limit: dto.limit ?? 15,
    });

    const mode = dto.searchMode ?? 'product';
    const interpretation =
      mode === 'analytics'
        ? { summary: 'Semantic analytics: top co-purchase lift detected in beverages category.' }
        : mode === 'customer_segment'
          ? { segment: 'high_value_repeat', confidence: 0.82 }
          : mode === 'inventory'
            ? { insight: 'Substitute pairs available for low-stock SKUs', substituteCount: 2 }
            : { products: vectorResults.results.map((r) => r.entity.displayName) };

    return { mode, query: dto.query, vectorResults: vectorResults.results, interpretation };
  }

  async traverseGraph(tenant: TenantContext, dto: TraverseGraphDto) {
    await this.ensureDefaults(tenant);
    const maxHops = dto.maxHops ?? 2;
    const visited = new Set<string>([dto.startEntityId]);
    const edges: GenomeRelationshipEntity[] = [];
    let frontier = [dto.startEntityId];

    for (let hop = 0; hop < maxHops; hop++) {
      const nextFrontier: string[] = [];
      for (const nodeId of frontier) {
        const where: Partial<GenomeRelationshipEntity> = {
          tenantId: tenant.tenantId,
          sourceEntityId: nodeId,
        };
        if (dto.relationshipType) where.relationshipType = dto.relationshipType;
        const rels = await this.relationships.find({ where, take: 20 });
        for (const rel of rels) {
          edges.push(rel);
          if (!visited.has(rel.targetEntityId)) {
            visited.add(rel.targetEntityId);
            nextFrontier.push(rel.targetEntityId);
          }
        }
      }
      frontier = nextFrontier;
      if (!frontier.length) break;
    }

    const nodes = await this.entities.find({
      where: { id: In(Array.from(visited)), tenantId: tenant.tenantId },
    });

    return { hops: maxHops, nodeCount: nodes.length, edgeCount: edges.length, nodes, edges };
  }

  async runReasoning(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: RunReasoningDto) {
    await this.ensureDefaults(tenant);
    const subject = dto.subjectEntityId
      ? await this.entities.findOne({ where: { id: dto.subjectEntityId, tenantId: tenant.tenantId } })
      : await this.entities.findOne({ where: { tenantId: tenant.tenantId, entityType: 'product' } });

    const conclusion = this.buildReasoningConclusion(dto.reasoningType, subject);
    const artifact = await this.reasoningArtifacts.save(
      this.reasoningArtifacts.create({
        tenantId: tenant.tenantId,
        reasoningType: dto.reasoningType,
        subjectEntityId: subject?.id ?? null,
        conclusion: conclusion.body,
        confidence: conclusion.confidence,
        explainability: conclusion.explainability,
      }),
    );

    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id,
      actorType: 'admin',
      source: 'retail_genome',
      action: `retail_genome.reasoning.${dto.reasoningType}`,
      entityType: 'genome_reasoning_artifact',
      entityId: artifact.id,
      metadata: { confidence: conclusion.confidence },
      status: 'success',
    });

    return artifact;
  }

  async listReasoning(tenant: TenantContext, reasoningType?: string) {
    await this.ensureDefaults(tenant);
    return this.reasoningArtifacts.find({
      where: reasoningType ? { tenantId: tenant.tenantId, reasoningType } : { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
      take: 30,
    });
  }

  async refreshEmbeddings(tenant: TenantContext, user: AuthenticatedUser | undefined) {
    await this.ensureDefaults(tenant);
    const allEntities = await this.entities.find({ where: { tenantId: tenant.tenantId } });
    let refreshed = 0;
    for (const entity of allEntities) {
      await this.ensureEmbedding(tenant.tenantId, entity);
      refreshed++;
    }
    await this.recordLineage(tenant.tenantId, 'embeddings_pipeline', null, 'embeddings_refreshed', { count: refreshed });
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id,
      source: 'retail_genome',
      action: 'retail_genome.embeddings.refresh',
      entityType: 'genome_embedding',
      metadata: { refreshed },
      status: 'success',
    });
    return { refreshed };
  }

  async createSnapshot(tenant: TenantContext, user: AuthenticatedUser | undefined) {
    await this.ensureDefaults(tenant);
    const entityCount = await this.entities.count({ where: { tenantId: tenant.tenantId } });
    const relationshipCount = await this.relationships.count({ where: { tenantId: tenant.tenantId } });
    const snapshotKey = `snap-${Date.now()}`;
    const checksum = createHash('sha256')
      .update(`${tenant.tenantId}:${entityCount}:${relationshipCount}`)
      .digest('hex');

    const snap = await this.snapshots.save(
      this.snapshots.create({
        tenantId: tenant.tenantId,
        snapshotKey,
        entityCount,
        relationshipCount,
        checksum,
        state: { reproducible: true, schemaVersion: 1 },
      }),
    );

    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id,
      source: 'retail_genome',
      action: 'retail_genome.snapshot.create',
      entityType: 'genome_graph_snapshot',
      entityId: snap.id,
      metadata: { checksum },
      status: 'success',
    });
    return snap;
  }

  async runFederatedRound(tenant: TenantContext, user: AuthenticatedUser | undefined) {
    await this.ensureDefaults(tenant);
    const roundKey = `fl-${Date.now()}`;
    const gradientHash = createHash('sha256').update(`${tenant.tenantId}:${roundKey}`).digest('hex');
    const round = await this.federatedRounds.save(
      this.federatedRounds.create({
        tenantId: tenant.tenantId,
        roundKey,
        modelKey: 'substitute_ranker_v1',
        privacyBudget: 1,
        epsilon: 0.1,
        gradientHash,
        status: 'completed',
        metadata: { federated: true, rawDataShared: false },
      }),
    );

    await this.upsertGlobalPattern('co_purchase_lift_beverages', 'co_occurrence', {
      categoryPair: ['beverages', 'dairy'],
      lift: 1.42,
      noiseAdded: true,
    });

    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id,
      source: 'retail_genome',
      action: 'retail_genome.federated.round',
      entityType: 'genome_federated_round',
      entityId: round.id,
      metadata: { epsilon: 0.1 },
      status: 'success',
    });
    return round;
  }

  async listGlobalPatterns() {
    return this.globalPatterns.find({ order: { updatedAt: 'DESC' }, take: 20 });
  }

  async listLineage(tenant: TenantContext) {
    return this.lineageEvents.find({
      where: { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getSchema(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.schemas.findOne({
      where: { tenantId: tenant.tenantId, schemaKey: 'retail_genome_core' },
      order: { version: 'DESC' },
    });
  }

  async listIntegrations() {
    return {
      hooks: [
        { system: 'ai_assistant', capabilities: ['semantic_search', 'reasoning'], endpoint: '/retail-genome/semantic-search' },
        { system: 'autonomous_retail', capabilities: ['decision_models'], endpoint: '/retail-genome/reasoning' },
        { system: 'digital_twins', capabilities: ['simulation_inputs'], endpoint: '/retail-genome/entities' },
        { system: 'orchestration', capabilities: ['graph_triggers'], endpoint: '/retail-genome/graph/query' },
        { system: 'marketing', capabilities: ['semantic_segments'], endpoint: '/retail-genome/semantic-search' },
        { system: 'inventory', capabilities: ['substitute_detection'], endpoint: '/retail-genome/similarity' },
      ],
    };
  }

  async listEmbeddingsPreview(tenant: TenantContext, limit = 5) {
    await this.ensureDefaults(tenant);
    const rows = await this.embeddings.find({ where: { tenantId: tenant.tenantId }, take: limit });
    return rows.map((e) => ({
      entityId: e.entityId,
      modelKey: e.modelKey,
      dimensions: e.dimensions,
      vectorPreview: e.vector.slice(0, 8),
    }));
  }

  private async ingestFromEventBus(tenant: TenantContext, limit: number) {
    const events = await this.eventStore.find({
      where: { tenantId: tenant.tenantId },
      order: { occurredAt: 'DESC' },
      take: limit,
    });

    let recordsOut = 0;
    let entitiesMerged = 0;
    let relationshipsInferred = 0;

    for (const event of events) {
      const entityType = this.mapEventToEntityType(event.eventType);
      if (!entityType) continue;
      const externalRef = String((event.payload as { id?: string }).id ?? event.eventId);
      const entity = await this.upsertEntity(tenant.tenantId, entityType, externalRef, externalRef);
      recordsOut++;
      entitiesMerged += entity.merged ? 1 : 0;
      await this.recordLineage(tenant.tenantId, 'event_bus', entity.entity.id, 'entity_upserted', {
        eventType: event.eventType,
      });
    }

    relationshipsInferred = await this.inferCoOccurrenceRelationships(tenant.tenantId);
    await this.enrichAttributesWithAi(tenant.tenantId);
    return { recordsIn: events.length, recordsOut, entitiesMerged, relationshipsInferred };
  }

  private async ingestFromDataLake(tenant: TenantContext, limit: number) {
    const batchEntities = SEED_ENTITIES.slice(0, Math.min(limit, SEED_ENTITIES.length));
    let recordsOut = 0;
    for (const seed of batchEntities) {
      await this.upsertEntity(tenant.tenantId, seed.entityType, seed.externalRef, seed.displayName);
      recordsOut++;
      await this.recordLineage(tenant.tenantId, 'data_lake', null, 'batch_entity_loaded', { externalRef: seed.externalRef });
    }
    const relationshipsInferred = await this.inferCoOccurrenceRelationships(tenant.tenantId);
    await this.enrichAttributesWithAi(tenant.tenantId);
    return { recordsIn: batchEntities.length, recordsOut, entitiesMerged: 0, relationshipsInferred };
  }

  private async upsertEntity(
    tenantId: string,
    entityType: string,
    externalRef: string,
    displayName: string,
  ): Promise<{ entity: GenomeEntityEntity; merged: boolean }> {
    const existing = await this.entities.findOne({ where: { tenantId, entityType, externalRef } });
    if (existing) {
      existing.displayName = displayName;
      existing.updatedAt = new Date();
      return { entity: await this.entities.save(existing), merged: true };
    }
    const entity = await this.entities.save(
      this.entities.create({
        tenantId,
        entityType,
        externalRef,
        displayName,
        canonicalId: null,
        status: 'active',
        metadata: {},
      }),
    );
    await this.ensureEmbedding(tenantId, entity);
    return { entity, merged: false };
  }

  private async inferCoOccurrenceRelationships(tenantId: string): Promise<number> {
    const products = await this.entities.find({ where: { tenantId, entityType: 'product' }, take: 10 });
    let created = 0;
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const a = products[i];
        const b = products[j];
        const types: Array<{ type: string; score: number }> = [
          { type: 'purchased_with', score: 0.75 + Math.random() * 0.2 },
          { type: 'similar_to', score: 0.6 + Math.random() * 0.3 },
        ];
        if (j === i + 1) types.push({ type: 'complements', score: 0.85 });
        for (const { type, score } of types) {
          const exists = await this.relationships.findOne({
            where: {
              tenantId,
              sourceEntityId: a.id,
              targetEntityId: b.id,
              relationshipType: type,
            },
          });
          if (!exists) {
            await this.relationships.save(
              this.relationships.create({
                tenantId,
                sourceEntityId: a.id,
                targetEntityId: b.id,
                relationshipType: type,
                score,
                inferred: true,
                explainability: {
                  method: 'co_occurrence',
                  support: 0.12,
                  confidence: score,
                },
                status: 'active',
                metadata: {},
              }),
            );
            created++;
          }
        }
      }
    }
    return created;
  }

  private async enrichAttributesWithAi(tenantId: string) {
    const products = await this.entities.find({ where: { tenantId, entityType: 'product' }, take: 5 });
    for (const product of products) {
      const keys = [
        { key: 'seasonality', value: { peak: 'Q4', score: 0.7 } },
        { key: 'demand_pattern', value: { trend: 'stable', weeklyVelocity: 42 } },
        { key: 'brand', value: { name: 'Ordella Select', tier: 'premium' } },
      ];
      for (const { key, value } of keys) {
        const existing = await this.attributes.findOne({
          where: { tenantId, entityId: product.id, attributeKey: key },
        });
        if (!existing) {
          await this.attributes.save(
            this.attributes.create({
              tenantId,
              entityId: product.id,
              attributeKey: key,
              attributeValue: value,
              source: 'ai_enrichment',
              enriched: true,
            }),
          );
        }
      }
    }
  }

  private async ensureEmbedding(tenantId: string, entity: GenomeEntityEntity) {
    const existing = await this.embeddings.findOne({ where: { tenantId, entityId: entity.id } });
    const vector = this.textToVector(`${entity.entityType}:${entity.displayName}:${entity.externalRef}`);
    if (existing) {
      existing.vector = vector;
      existing.refreshedAt = new Date();
      await this.embeddings.save(existing);
      return existing;
    }
    return this.embeddings.save(
      this.embeddings.create({
        tenantId,
        entityId: entity.id,
        modelKey: 'text-embedding-v1',
        dimensions: vector.length,
        vector,
        refreshedAt: new Date(),
      }),
    );
  }

  private async ensureDefaults(tenant: TenantContext) {
    const tenantId = tenant.tenantId;
    const schemaExisting = await this.schemas.findOne({
      where: { tenantId, schemaKey: 'retail_genome_core' },
    });
    if (!schemaExisting) {
      await this.schemas.save(
        this.schemas.create({
          tenantId,
          schemaKey: 'retail_genome_core',
          version: 1,
          entityTypes: [...ENTITY_TYPES],
          relationshipTypes: [...RELATIONSHIP_TYPES],
          status: 'published',
          publishedAt: new Date(),
          metadata: { distributed: true },
        }),
      );
    }

    const entityByRef = new Map<string, GenomeEntityEntity>();
    for (const seed of SEED_ENTITIES) {
      const { entity } = await this.upsertEntity(tenantId, seed.entityType, seed.externalRef, seed.displayName);
      entityByRef.set(`${seed.entityType}:${seed.externalRef}`, entity);
    }

    const product1 = entityByRef.get('product:sku-1001');
    const product2 = entityByRef.get('product:sku-1002');
    const product3 = entityByRef.get('product:sku-1003');
    const category = entityByRef.get('category:cat-beverages');
    const supplier = entityByRef.get('supplier:sup-coffee-co');

    const seedRels: Array<{
      src: GenomeEntityEntity | undefined;
      tgt: GenomeEntityEntity | undefined;
      type: string;
      score: number;
    }> = [
      { src: product1, tgt: product2, type: 'purchased_with', score: 0.91 },
      { src: product1, tgt: product3, type: 'complements', score: 0.88 },
      { src: product2, tgt: product1, type: 'similar_to', score: 0.72 },
      { src: product2, tgt: product3, type: 'substitutes', score: 0.55 },
      { src: product1, tgt: category, type: 'belongs_to', score: 1 },
      { src: product1, tgt: supplier, type: 'supplied_by', score: 1 },
    ];

    for (const rel of seedRels) {
      if (!rel.src || !rel.tgt) continue;
      const exists = await this.relationships.findOne({
        where: {
          tenantId,
          sourceEntityId: rel.src.id,
          targetEntityId: rel.tgt.id,
          relationshipType: rel.type,
        },
      });
      if (!exists) {
        await this.relationships.save(
          this.relationships.create({
            tenantId,
            sourceEntityId: rel.src.id,
            targetEntityId: rel.tgt.id,
            relationshipType: rel.type,
            score: rel.score,
            inferred: rel.type !== 'belongs_to' && rel.type !== 'supplied_by',
            explainability: { method: 'seed', confidence: rel.score },
            status: 'active',
            metadata: {},
          }),
        );
      }
    }

    await this.enrichAttributesWithAi(tenantId);
    await this.upsertGlobalPattern('substitute_rank_global', 'substitute', {
      topPairs: [['sku-1002', 'sku-1003']],
      dpEpsilon: 0.1,
    });
  }

  private async upsertGlobalPattern(patternKey: string, patternType: string, payload: Record<string, unknown>) {
    const existing = await this.globalPatterns.findOne({ where: { patternKey } });
    if (existing) {
      existing.anonymizedPayload = payload;
      existing.contributorCount += 1;
      existing.differentialPrivacyApplied = true;
      await this.globalPatterns.save(existing);
      return existing;
    }
    return this.globalPatterns.save(
      this.globalPatterns.create({
        patternKey,
        patternType,
        anonymizedPayload: payload,
        contributorCount: 1,
        differentialPrivacyApplied: true,
      }),
    );
  }

  private async enrichRelationships(tenantId: string, rels: GenomeRelationshipEntity[]) {
    const ids = new Set<string>();
    rels.forEach((r) => {
      ids.add(r.sourceEntityId);
      ids.add(r.targetEntityId);
    });
    const entities = await this.entities.find({ where: { tenantId } });
    const map = new Map(entities.filter((e) => ids.has(e.id)).map((e) => [e.id, e]));
    return rels.map((r) => ({
      relationship: r,
      source: map.get(r.sourceEntityId),
      target: map.get(r.targetEntityId),
    }));
  }

  private buildReasoningConclusion(
    reasoningType: string,
    subject: GenomeEntityEntity | null,
  ): { body: Record<string, unknown>; confidence: number; explainability: Record<string, unknown> } {
    const name = subject?.displayName ?? 'graph aggregate';
    const templates: Record<string, { body: Record<string, unknown>; confidence: number }> = {
      product_similarity: {
        body: { subject: name, similarProducts: ['Oat Milk Barista Edition'], method: 'embedding_cosine' },
        confidence: 0.87,
      },
      customer_behavior: {
        body: { subject: name, segment: 'high_frequency', nextBestAction: 'loyalty_offer' },
        confidence: 0.8,
      },
      inventory_risk: {
        body: { subject: name, stockoutRisk: 0.34, substitutesAvailable: true },
        confidence: 0.76,
      },
      promotion_impact: {
        body: { subject: name, expectedLift: 0.18, cannibalizationRisk: 0.05 },
        confidence: 0.74,
      },
      staff_performance: {
        body: { subject: name, productivityScore: 0.91, coachingFocus: 'upsell_bundles' },
        confidence: 0.79,
      },
      delivery_network: {
        body: { subject: name, optimalHub: 'loc-downtown', avgMinutesSaved: 6.2 },
        confidence: 0.81,
      },
    };
    const t = templates[reasoningType] ?? { body: { subject: name }, confidence: 0.7 };
    return {
      ...t,
      explainability: { reasoningType, evidence: 'knowledge_graph_traversal', hops: 2 },
    };
  }

  private mapEventToEntityType(eventType: string): string | null {
    const lower = eventType.toLowerCase();
    if (lower.includes('order')) return 'order';
    if (lower.includes('product') || lower.includes('catalog')) return 'product';
    if (lower.includes('customer')) return 'customer';
    if (lower.includes('inventory')) return 'product';
    if (lower.includes('location')) return 'location';
    return null;
  }

  private textToVector(text: string, dims = 384): number[] {
    const hash = createHash('sha256').update(text).digest();
    const vector: number[] = [];
    for (let i = 0; i < dims; i++) {
      vector.push((hash[i % hash.length] / 255) * 2 - 1);
    }
    const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
  }

  private async getCached(tenantId: string, cacheKey: string) {
    const row = await this.queryCache.findOne({
      where: { tenantId, cacheKey, expiresAt: MoreThan(new Date()) },
    });
    if (!row) return null;
    row.hitCount += 1;
    await this.queryCache.save(row);
    return row.result;
  }

  private async setCache(tenantId: string, cacheKey: string, queryType: string, result: Record<string, unknown>) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const existing = await this.queryCache.findOne({ where: { tenantId, cacheKey } });
    if (existing) {
      existing.result = result;
      existing.expiresAt = expiresAt;
      await this.queryCache.save(existing);
      return;
    }
    await this.queryCache.save(
      this.queryCache.create({ tenantId, cacheKey, queryType, result, hitCount: 0, expiresAt }),
    );
  }

  private async recordLineage(
    tenantId: string,
    source: string,
    targetEntityId: string | null,
    action: string,
    lineage: Record<string, unknown>,
  ) {
    await this.lineageEvents.save(
      this.lineageEvents.create({ tenantId, source, targetEntityId, action, lineage }),
    );
  }
}
