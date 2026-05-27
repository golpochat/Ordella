import { RetailGenomePanel } from '@/components/retail-genome/retail-genome-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import {
  fetchGenomeDashboard,
  listGenomeEmbeddingsPreview,
  listGenomeEntities,
  listGenomeReasoning,
  listGenomeRelationships,
  type GenomeDashboard,
  type GenomeEmbeddingPreview,
  type GenomeEntity,
  type GenomeReasoning,
  type GenomeRelationship,
} from '@/lib/api/admin/retail-genome';
import { createServerApiClient } from '@/lib/api/server';
import { getErrorMessage } from '@/lib/utils';

export default async function RetailGenomePage() {
  const api = createServerApiClient();
  let dashboard: GenomeDashboard | null = null;
  let entities: GenomeEntity[] = [];
  let relationships: GenomeRelationship[] = [];
  let embeddings: GenomeEmbeddingPreview[] = [];
  let reasoning: GenomeReasoning[] = [];
  let error: string | null = null;

  try {
    [dashboard, entities, relationships, embeddings, reasoning] = await Promise.all([
      fetchGenomeDashboard(api),
      listGenomeEntities(api),
      listGenomeRelationships(api),
      listGenomeEmbeddingsPreview(api),
      listGenomeReasoning(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Retail Genome"
        description="Unified retail knowledge graph — entities, relationships, embeddings, and privacy-preserving learning."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <RetailGenomePanel
        dashboard={dashboard}
        entities={entities}
        relationships={relationships}
        embeddings={embeddings}
        reasoning={reasoning}
      />
    </>
  );
}
