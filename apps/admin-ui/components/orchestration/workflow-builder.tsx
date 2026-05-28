'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useCallback, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import type { WorkflowDetail } from '@/lib/api/admin/orchestration';

const STEP_PALETTE = [
  { type: 'data_fetch', label: 'Data fetch' },
  { type: 'condition', label: 'Condition' },
  { type: 'delay', label: 'Delay' },
  { type: 'approval', label: 'Approval' },
  { type: 'notification', label: 'Notification' },
  { type: 'entity_mutation', label: 'Entity mutation' },
  { type: 'integration', label: 'Integration' },
  { type: 'ai_action', label: 'AI action' },
  { type: 'custom_code', label: 'Custom code' },
] as const;

type CanvasNode = {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  nextOnSuccess?: string;
  nextOnFailure?: string;
  parallelGroup?: string;
};

type WorkflowBuilderProps = {
  detail: WorkflowDetail;
  onSave: (payload: {
    nodes: Array<Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
    steps: Array<{
      stepKey: string;
      stepType: string;
      label: string;
      stepOrder: number;
      config: Record<string, unknown>;
      nextOnSuccess?: string;
      nextOnFailure?: string;
      parallelGroup?: string;
    }>;
  }) => Promise<void>;
};

export function WorkflowBuilder({ detail, onSave }: WorkflowBuilderProps) {
  const initialNodes: CanvasNode[] = (detail.version?.canvasDefinition.nodes ?? []).map((node, index) => ({
    id: String(node.id ?? `step-${index}`),
    type: String(node.type ?? 'data_fetch'),
    label: String(node.label ?? node.id ?? `Step ${index + 1}`),
    position: (node.position as { x: number; y: number }) ?? { x: 80 + index * 180, y: 120 },
    config: (node.config as Record<string, unknown>) ?? {},
    nextOnSuccess: node.nextOnSuccess as string | undefined,
    nextOnFailure: node.nextOnFailure as string | undefined,
    parallelGroup: node.parallelGroup as string | undefined,
  }));

  const [nodes, setNodes] = useState<CanvasNode[]>(
    initialNodes.length
      ? initialNodes
      : [{ id: 'start', type: 'data_fetch', label: 'Start fetch', position: { x: 80, y: 120 }, config: { source: 'event_bus', topicKey: 'orders' } }],
  );
  const [edges, setEdges] = useState<Array<Record<string, unknown>>>(detail.version?.canvasDefinition.edges ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(nodes[0]?.id ?? null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  const addNode = useCallback((type: string, label: string) => {
    const id = `${type}-${Date.now()}`;
    setNodes((current) => [
      ...current,
      {
        id,
        type,
        label,
        position: { x: 80 + current.length * 160, y: 120 + (current.length % 2) * 80 },
        config: defaultConfig(type),
      },
    ]);
    setSelectedId(id);
  }, []);

  const onDragStart = (event: React.DragEvent, type: string, label: string) => {
    event.dataTransfer.setData('application/orchestration-step', JSON.stringify({ type, label }));
  };

  const onCanvasDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData('application/orchestration-step');
    if (!raw) return;
    const { type, label } = JSON.parse(raw) as { type: string; label: string };
    addNode(type, label);
  };

  const onNodeDrag = (id: string, event: React.DragEvent) => {
    const rect = (event.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left - 70;
    const y = event.clientY - rect.top - 24;
    setNodes((current) => current.map((n) => (n.id === id ? { ...n, position: { x: Math.max(0, x), y: Math.max(0, y) } } : n)));
  };

  const connectNodes = (fromId: string, toId: string) => {
    setEdges((current) => [...current.filter((e) => e.source !== fromId), { id: `e-${fromId}-${toId}`, source: fromId, target: toId }]);
    setNodes((current) => current.map((n) => (n.id === fromId ? { ...n, nextOnSuccess: toId } : n)));
  };

  async function handleSave() {
    setSaving(true);
    try {
      const steps = nodes.map((node, index) => ({
        stepKey: node.id,
        stepType: node.type,
        label: node.label,
        stepOrder: index,
        config: node.config,
        nextOnSuccess: node.nextOnSuccess,
        nextOnFailure: node.nextOnFailure,
        parallelGroup: node.parallelGroup,
      }));
      await onSave({
        nodes: nodes.map((n) => ({ id: n.id, type: n.type, label: n.label, position: n.position, config: n.config, nextOnSuccess: n.nextOnSuccess, nextOnFailure: n.nextOnFailure, parallelGroup: n.parallelGroup })),
        edges,
        steps,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[220px_1fr_280px]">
      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {STEP_PALETTE.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type, item.label)}
              className="cursor-grab rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              {item.label}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Drag steps onto the canvas. Use Connect mode for branching.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Canvas</CardTitle>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setConnectFrom(selectedId)}>
              {connectFrom ? `Connect from ${connectFrom}` : 'Connect'}
            </Button>
            <Button type="button" size="sm" onClick={() => void handleSave()} isLoading={saving} loadingLabel="Saving…">
              Save workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="relative min-h-[420px] rounded-md border bg-muted/30"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onCanvasDrop}
          >
            {nodes.map((node) => (
              <div
                key={node.id}
                draggable
                onDragEnd={(e) => onNodeDrag(node.id, e)}
                onClick={() => {
                  if (connectFrom && connectFrom !== node.id) {
                    connectNodes(connectFrom, node.id);
                    setConnectFrom(null);
                  } else {
                    setSelectedId(node.id);
                  }
                }}
                className={`absolute w-36 cursor-pointer rounded-md border bg-background p-2 shadow-sm ${selectedId === node.id ? 'border-primary ring-2 ring-primary/30' : ''}`}
                style={{ left: node.position.x, top: node.position.y }}
              >
                <Tag variant="neutral" className="mb-1">
                  <TagLabel>{node.type}</TagLabel>
                </Tag>
                <p className="text-xs font-medium">{node.label}</p>
                {node.parallelGroup ? <p className="text-[10px] text-muted-foreground">∥ {node.parallelGroup}</p> : null}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {edges.length} connection(s). Error paths: configure nextOnFailure in step panel.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selected ? (
            <>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">Label</span>
                <Input
                  value={selected.label}
                  onChange={(e) => setNodes((current) => current.map((n) => (n.id === selected.id ? { ...n, label: e.target.value } : n)))}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">Parallel group</span>
                <Input
                  value={selected.parallelGroup ?? ''}
                  onChange={(e) => setNodes((current) => current.map((n) => (n.id === selected.id ? { ...n, parallelGroup: e.target.value || undefined } : n)))}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">On success →</span>
                <Input
                  value={selected.nextOnSuccess ?? ''}
                  onChange={(e) => setNodes((current) => current.map((n) => (n.id === selected.id ? { ...n, nextOnSuccess: e.target.value || undefined } : n)))}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">On failure / else →</span>
                <Input
                  value={selected.nextOnFailure ?? ''}
                  onChange={(e) => setNodes((current) => current.map((n) => (n.id === selected.id ? { ...n, nextOnFailure: e.target.value || undefined } : n)))}
                />
              </label>
              <ConfigFields
                stepType={selected.type}
                config={selected.config}
                onChange={(config) => setNodes((current) => current.map((n) => (n.id === selected.id ? { ...n, config } : n)))}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a step to configure branching, parallel groups, and integrations.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConfigFields({
  stepType,
  config,
  onChange,
}: {
  stepType: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  const set = (key: string, value: string) => onChange({ ...config, [key]: value });

  if (stepType === 'data_fetch') {
    return (
      <>
        <Field label="Source" value={String(config.source ?? 'event_bus')} onChange={(v) => set('source', v)} />
        <Field label="Topic / table" value={String(config.topicKey ?? config.tableKey ?? '')} onChange={(v) => set('topicKey', v)} />
      </>
    );
  }
  if (stepType === 'condition') {
    return (
      <>
        <Field label="Field path" value={String(config.field ?? '')} onChange={(v) => set('field', v)} />
        <Field label="Operator" value={String(config.operator ?? 'gt')} onChange={(v) => set('operator', v)} />
        <Field label="Value" value={String(config.value ?? '')} onChange={(v) => set('value', v)} />
      </>
    );
  }
  if (stepType === 'notification') {
    return (
      <>
        <Field label="Channel" value={String(config.channel ?? 'in_app')} onChange={(v) => set('channel', v)} />
        <Field label="Title" value={String(config.title ?? '')} onChange={(v) => set('title', v)} />
        <Field label="Body" value={String(config.body ?? '')} onChange={(v) => set('body', v)} />
      </>
    );
  }
  if (stepType === 'ai_action') {
    return <Field label="Action type" value={String(config.actionType ?? 'generate_summary')} onChange={(v) => set('actionType', v)} />;
  }
  if (stepType === 'custom_code') {
    return <Field label="Expression (sandboxed)" value={String(config.expression ?? 'true')} onChange={(v) => set('expression', v)} />;
  }
  return <p className="text-xs text-muted-foreground">No extra config for this step type.</p>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function defaultConfig(type: string): Record<string, unknown> {
  switch (type) {
    case 'data_fetch':
      return { source: 'event_bus', topicKey: 'orders', limit: 10 };
    case 'condition':
      return { field: 'rows.count', operator: 'gt', value: 0 };
    case 'delay':
      return { milliseconds: 1000 };
    case 'approval':
      return { assigneeUserIds: [], escalateAfterMinutes: 60 };
    case 'notification':
      return { channel: 'in_app', title: 'Workflow', body: 'Step completed' };
    case 'entity_mutation':
      return { entityType: 'order', action: 'create' };
    case 'integration':
      return { connector: 'webhook', webhookUrl: '' };
    case 'ai_action':
      return { actionType: 'generate_summary' };
    case 'custom_code':
      return { expression: 'true' };
    default:
      return {};
  }
}
