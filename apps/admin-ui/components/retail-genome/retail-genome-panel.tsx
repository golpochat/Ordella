'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  getGenomeEntityGraph,
  listGenomeEntities,
  runGenomeIngestion,
  runGenomeReasoning,
  runGenomeSemanticSearch,
  type GenomeDashboard,
  type GenomeEmbeddingPreview,
  type GenomeEntity,
  type GenomeReasoning,
  type GenomeRelationship,
} from '@/lib/api/admin/retail-genome';
import { getErrorMessage } from '@/lib/utils';

type RetailGenomePanelProps = {
  dashboard: GenomeDashboard | null;
  entities: GenomeEntity[];
  relationships: GenomeRelationship[];
  embeddings: GenomeEmbeddingPreview[];
  reasoning: GenomeReasoning[];
};

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function RetailGenomePanel({
  dashboard,
  entities: initialEntities,
  relationships: initialRelationships,
  embeddings,
  reasoning: initialReasoning,
}: RetailGenomePanelProps) {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [entities, setEntities] = useState(initialEntities);
  const [relationships] = useState(initialRelationships);
  const [reasoning, setReasoning] = useState(initialReasoning);
  const [selectedEntityId, setSelectedEntityId] = useState(initialEntities[0]?.id ?? '');
  const [graphView, setGraphView] = useState<Record<string, unknown> | null>(null);
  const [semanticQuery, setSemanticQuery] = useState('organic coffee substitutes');
  const [semanticResult, setSemanticResult] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const products = entities.filter((e) => e.entityType === 'product');

  async function handleSelectEntity(entityId: string) {
    setSelectedEntityId(entityId);
    setMessage(null);
    setError(null);
    try {
      const graph = await getGenomeEntityGraph(api, entityId);
      setGraphView(graph as Record<string, unknown>);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleIngest(source: 'event_bus' | 'data_lake') {
    setMessage(null);
    setError(null);
    try {
      await runGenomeIngestion(api, source, 100);
      setEntities(await listGenomeEntities(api));
      setMessage(`Ingestion from ${source} completed.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleSemanticSearch() {
    setMessage(null);
    setError(null);
    try {
      const result = await runGenomeSemanticSearch(api, semanticQuery, 'product');
      setSemanticResult(result as Record<string, unknown>);
      setMessage('Semantic search completed.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleReasoning() {
    if (!selectedEntityId) return;
    setMessage(null);
    setError(null);
    try {
      const artifact = await runGenomeReasoning(api, 'product_similarity', selectedEntityId);
      setReasoning((current) => [artifact, ...current]);
      setMessage('Reasoning artifact created.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const outgoing = (graphView?.outgoing as Array<{ relationshipType: string; target: { displayName: string } | null }>) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Metric title="Entities" value={dashboard?.entityCount ?? entities.length} />
        <Metric title="Relationships" value={dashboard?.relationshipCount ?? relationships.length} />
        <Metric title="Embeddings" value={dashboard?.embeddingCount ?? embeddings.length} />
        <Metric title="Inferred" value={dashboard?.inferredRelationships ?? 0} />
        <Metric title="Graph health" value={dashboard?.graphHealth ?? '—'} />
        <Metric title="Cache hits" value={dashboard?.cacheHits ?? 0} />
      </div>

      {message ? <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">{message}</p> : null}
      {error ? <p className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => void handleIngest('event_bus')}>
          Ingest Event Bus
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => void handleIngest('data_lake')}>
          Ingest Data Lake
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => void handleReasoning()} disabled={!selectedEntityId}>
          Run similarity reasoning
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge graph explorer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedEntityId}
              onChange={(e) => void handleSelectEntity(e.target.value)}
            >
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.entityType}] {e.displayName}
                </option>
              ))}
            </select>
            {graphView ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium">{(graphView.entity as GenomeEntity)?.displayName}</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {outgoing.slice(0, 8).map((edge, idx) => (
                    <li key={idx}>
                      {edge.relationshipType} → {edge.target?.displayName ?? 'unknown'}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select an entity to explore relationships.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semantic search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={semanticQuery} onChange={(e) => setSemanticQuery(e.target.value)} />
            <Button type="button" size="sm" onClick={() => void handleSemanticSearch()}>
              Search
            </Button>
            {semanticResult ? (
              <pre className="max-h-40 overflow-auto rounded border bg-muted/30 p-2 text-xs">
                {JSON.stringify(semanticResult.interpretation ?? semanticResult, null, 2)}
              </pre>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Similarity map (products)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <Button key={p.id} type="button" size="sm" variant={p.id === selectedEntityId ? 'default' : 'outline'} onClick={() => void handleSelectEntity(p.id)}>
                {p.displayName}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entity relationship viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Inferred</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relationships.slice(0, 12).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.relationshipType}</TableCell>
                    <TableCell>{String(r.score)}</TableCell>
                    <TableCell>
                      <Badge variant={r.inferred ? 'secondary' : 'outline'}>{r.inferred ? 'yes' : 'no'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embedding visualizer (preview)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Dims</TableHead>
                  <TableHead>Vector preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {embeddings.map((e) => (
                  <TableRow key={e.entityId}>
                    <TableCell className="font-mono text-xs">{e.entityId.slice(0, 8)}…</TableCell>
                    <TableCell>{e.modelKey}</TableCell>
                    <TableCell>{e.dimensions}</TableCell>
                    <TableCell className="font-mono text-xs">{e.vectorPreview.map((v) => v.toFixed(2)).join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI reasoning artifacts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reasoning.slice(0, 8).map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.reasoningType}</TableCell>
                  <TableCell>{String(r.confidence)}</TableCell>
                  <TableCell className="max-w-md truncate text-xs">{JSON.stringify(r.conclusion)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
