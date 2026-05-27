import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const dashboardSchema = z.object({
  entityCount: z.number(),
  relationshipCount: z.number(),
  embeddingCount: z.number(),
  inferredRelationships: z.number(),
  reasoningArtifacts: z.number(),
  cacheHits: z.number(),
  graphHealth: z.string(),
  distributedStorage: z.string(),
  vectorIndex: z.string(),
});

const entitySchema = z.object({
  id: z.string().uuid(),
  entityType: z.string(),
  externalRef: z.string(),
  displayName: z.string(),
  status: z.string(),
});

const relationshipSchema = z.object({
  id: z.string().uuid(),
  sourceEntityId: z.string().uuid(),
  targetEntityId: z.string().uuid(),
  relationshipType: z.string(),
  score: z.union([z.number(), z.string()]),
  inferred: z.boolean(),
  explainability: z.record(z.unknown()),
});

const embeddingPreviewSchema = z.object({
  entityId: z.string().uuid(),
  modelKey: z.string(),
  dimensions: z.number(),
  vectorPreview: z.array(z.number()),
});

const reasoningSchema = z.object({
  id: z.string().uuid(),
  reasoningType: z.string(),
  confidence: z.union([z.number(), z.string()]),
  conclusion: z.record(z.unknown()),
  explainability: z.record(z.unknown()),
});

export type GenomeDashboard = z.infer<typeof dashboardSchema>;
export type GenomeEntity = z.infer<typeof entitySchema>;
export type GenomeRelationship = z.infer<typeof relationshipSchema>;
export type GenomeEmbeddingPreview = z.infer<typeof embeddingPreviewSchema>;
export type GenomeReasoning = z.infer<typeof reasoningSchema>;

export async function fetchGenomeDashboard(api: ApiClient): Promise<GenomeDashboard> {
  return dashboardSchema.parse(await api.getData<unknown>('retail-genome/dashboard'));
}

export async function listGenomeEntities(api: ApiClient, entityType?: string): Promise<GenomeEntity[]> {
  const path = entityType ? `retail-genome/entities?entityType=${encodeURIComponent(entityType)}` : 'retail-genome/entities';
  return entitySchema.array().parse(await api.getData<unknown[]>(path));
}

export async function listGenomeRelationships(api: ApiClient): Promise<GenomeRelationship[]> {
  return relationshipSchema.array().parse(await api.getData<unknown[]>('retail-genome/relationships'));
}

export async function getGenomeEntityGraph(api: ApiClient, entityId: string) {
  return api.getData<unknown>(`retail-genome/entities/${entityId}/graph`);
}

export async function listGenomeEmbeddingsPreview(api: ApiClient): Promise<GenomeEmbeddingPreview[]> {
  return embeddingPreviewSchema.array().parse(await api.getData<unknown[]>('retail-genome/embeddings/preview'));
}

export async function listGenomeReasoning(api: ApiClient): Promise<GenomeReasoning[]> {
  return reasoningSchema.array().parse(await api.getData<unknown[]>('retail-genome/reasoning'));
}

export async function runGenomeIngestion(api: ApiClient, source: 'event_bus' | 'data_lake', limit?: number) {
  return api.postData<unknown>('retail-genome/ingest', { source, limit });
}

export async function runGenomeSemanticSearch(api: ApiClient, query: string, searchMode?: string) {
  return api.postData<unknown>('retail-genome/search/semantic', { query, searchMode });
}

export async function runGenomeReasoning(
  api: ApiClient,
  reasoningType: string,
  subjectEntityId?: string,
) {
  return reasoningSchema.parse(
    await api.postData<unknown>('retail-genome/reasoning', { reasoningType, subjectEntityId }),
  );
}

export async function refreshGenomeEmbeddings(api: ApiClient) {
  return api.postData<unknown>('retail-genome/embeddings/refresh', {});
}
