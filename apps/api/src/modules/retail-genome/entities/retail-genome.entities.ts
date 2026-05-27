import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('genome_graph_schemas')
@Index(['tenantId', 'schemaKey', 'version'], { unique: true })
export class GenomeGraphSchemaEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'schema_key', type: 'varchar', length: 96 })
  schemaKey!: string;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ name: 'entity_types', type: 'jsonb', default: [] })
  entityTypes!: unknown[];

  @Column({ name: 'relationship_types', type: 'jsonb', default: [] })
  relationshipTypes!: unknown[];

  @Column({ type: 'varchar', length: 32, default: 'published' })
  status!: string;

  @Column({ name: 'published_at', type: 'timestamptz', default: () => 'NOW()' })
  publishedAt!: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;
}

@Entity('genome_entities')
@Index(['tenantId', 'entityType', 'externalRef'], { unique: true })
export class GenomeEntityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 64 })
  entityType!: string;

  @Column({ name: 'external_ref', type: 'varchar', length: 128 })
  externalRef!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255, default: '' })
  displayName!: string;

  @Column({ name: 'canonical_id', type: 'uuid', nullable: true })
  canonicalId!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('genome_relationships')
@Index(['tenantId', 'sourceEntityId', 'targetEntityId', 'relationshipType'], { unique: true })
export class GenomeRelationshipEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'source_entity_id', type: 'uuid' })
  sourceEntityId!: string;

  @Column({ name: 'target_entity_id', type: 'uuid' })
  targetEntityId!: string;

  @Column({ name: 'relationship_type', type: 'varchar', length: 64 })
  relationshipType!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 1 })
  score!: number;

  @Column({ type: 'boolean', default: false })
  inferred!: boolean;

  @Column({ type: 'jsonb', default: {} })
  explainability!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('genome_attributes')
@Index(['tenantId', 'entityId', 'attributeKey'], { unique: true })
export class GenomeAttributeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'attribute_key', type: 'varchar', length: 96 })
  attributeKey!: string;

  @Column({ name: 'attribute_value', type: 'jsonb', default: {} })
  attributeValue!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 64, default: 'ingestion' })
  source!: string;

  @Column({ type: 'boolean', default: false })
  enriched!: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('genome_embeddings')
@Index(['tenantId', 'entityId', 'modelKey'], { unique: true })
export class GenomeEmbeddingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'model_key', type: 'varchar', length: 64, default: 'text-embedding-v1' })
  modelKey!: string;

  @Column({ type: 'int', default: 384 })
  dimensions!: number;

  @Column({ type: 'jsonb', default: [] })
  vector!: number[];

  @Column({ name: 'refreshed_at', type: 'timestamptz', default: () => 'NOW()' })
  refreshedAt!: Date;
}

@Entity('genome_ingestion_runs')
export class GenomeIngestionRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'pipeline_key', type: 'varchar', length: 96 })
  pipelineKey!: string;

  @Column({ type: 'varchar', length: 64 })
  source!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: string;

  @Column({ name: 'records_in', type: 'int', default: 0 })
  recordsIn!: number;

  @Column({ name: 'records_out', type: 'int', default: 0 })
  recordsOut!: number;

  @Column({ name: 'entities_merged', type: 'int', default: 0 })
  entitiesMerged!: number;

  @Column({ name: 'relationships_inferred', type: 'int', default: 0 })
  relationshipsInferred!: number;

  @Column({ type: 'jsonb', default: [] })
  errors!: unknown[];

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'NOW()' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;
}

@Entity('genome_query_cache')
@Index(['tenantId', 'cacheKey'], { unique: true })
export class GenomeQueryCacheEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'cache_key', type: 'varchar', length: 255 })
  cacheKey!: string;

  @Column({ name: 'query_type', type: 'varchar', length: 64 })
  queryType!: string;

  @Column({ type: 'jsonb', default: {} })
  result!: Record<string, unknown>;

  @Column({ name: 'hit_count', type: 'int', default: 0 })
  hitCount!: number;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('genome_reasoning_artifacts')
export class GenomeReasoningArtifactEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'reasoning_type', type: 'varchar', length: 64 })
  reasoningType!: string;

  @Column({ name: 'subject_entity_id', type: 'uuid', nullable: true })
  subjectEntityId!: string | null;

  @Column({ type: 'jsonb', default: {} })
  conclusion!: Record<string, unknown>;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.8 })
  confidence!: number;

  @Column({ type: 'jsonb', default: {} })
  explainability!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('genome_federated_rounds')
@Index(['tenantId', 'roundKey'], { unique: true })
export class GenomeFederatedRoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'round_key', type: 'varchar', length: 96 })
  roundKey!: string;

  @Column({ name: 'model_key', type: 'varchar', length: 96 })
  modelKey!: string;

  @Column({ name: 'privacy_budget', type: 'decimal', precision: 8, scale: 4, default: 1 })
  privacyBudget!: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0.1 })
  epsilon!: number;

  @Column({ name: 'gradient_hash', type: 'varchar', length: 128, default: '' })
  gradientHash!: string;

  @Column({ type: 'varchar', length: 32, default: 'completed' })
  status!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ name: 'completed_at', type: 'timestamptz', default: () => 'NOW()' })
  completedAt!: Date;
}

@Entity('genome_global_patterns')
@Index(['patternKey'], { unique: true })
export class GenomeGlobalPatternEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pattern_key', type: 'varchar', length: 96 })
  patternKey!: string;

  @Column({ name: 'pattern_type', type: 'varchar', length: 64 })
  patternType!: string;

  @Column({ name: 'anonymized_payload', type: 'jsonb', default: {} })
  anonymizedPayload!: Record<string, unknown>;

  @Column({ name: 'contributor_count', type: 'int', default: 0 })
  contributorCount!: number;

  @Column({ name: 'differential_privacy_applied', type: 'boolean', default: true })
  differentialPrivacyApplied!: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('genome_lineage_events')
export class GenomeLineageEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 64 })
  source!: string;

  @Column({ name: 'target_entity_id', type: 'uuid', nullable: true })
  targetEntityId!: string | null;

  @Column({ type: 'varchar', length: 128 })
  action!: string;

  @Column({ type: 'jsonb', default: {} })
  lineage!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('genome_graph_snapshots')
@Index(['tenantId', 'snapshotKey'], { unique: true })
export class GenomeGraphSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'snapshot_key', type: 'varchar', length: 96 })
  snapshotKey!: string;

  @Column({ name: 'entity_count', type: 'int', default: 0 })
  entityCount!: number;

  @Column({ name: 'relationship_count', type: 'int', default: 0 })
  relationshipCount!: number;

  @Column({ type: 'varchar', length: 64, default: '' })
  checksum!: string;

  @Column({ type: 'jsonb', default: {} })
  state!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

export const RETAIL_GENOME_ENTITIES = [
  GenomeGraphSchemaEntity,
  GenomeEntityEntity,
  GenomeRelationshipEntity,
  GenomeAttributeEntity,
  GenomeEmbeddingEntity,
  GenomeIngestionRunEntity,
  GenomeQueryCacheEntity,
  GenomeReasoningArtifactEntity,
  GenomeFederatedRoundEntity,
  GenomeGlobalPatternEntity,
  GenomeLineageEventEntity,
  GenomeGraphSnapshotEntity,
];
