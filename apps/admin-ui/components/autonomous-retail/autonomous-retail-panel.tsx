'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  generateAutonomousDecisions,
  listAutonomousDecisions,
  listAutonomousActions,
  resolveAutonomousDecision,
  rollbackAutonomousAction,
  updateAutonomousPolicy,
  type AutonomousAction,
  type AutonomousDashboard,
  type AutonomousDecision,
  type AutonomousPolicy,
} from '@/lib/api/admin/autonomous-retail';
import { formatDate, getErrorMessage } from '@/lib/utils';

type AutonomousRetailPanelProps = {
  dashboard: AutonomousDashboard | null;
  policies: AutonomousPolicy[];
  pendingDecisions: AutonomousDecision[];
  actions: AutonomousAction[];
};

export function AutonomousRetailPanel({ dashboard, policies, pendingDecisions: initialPending, actions: initialActions }: AutonomousRetailPanelProps) {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [tenantPolicy, setTenantPolicy] = useState(policies.find((p) => !p.locationId) ?? policies[0]);
  const [pending, setPending] = useState(initialPending);
  const [actions, setActions] = useState(initialActions);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setPending(await listAutonomousDecisions(api, 'pending'));
    setActions(await listAutonomousActions(api));
  }

  async function handleModeChange(mode: AutonomousPolicy['mode']) {
    if (!tenantPolicy) return;
    setError(null);
    try {
      const updated = await updateAutonomousPolicy(api, { mode, locationId: tenantPolicy.locationId });
      setTenantPolicy(updated);
      setMessage(`Autonomy mode set to ${mode}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleGenerate() {
    setError(null);
    try {
      await generateAutonomousDecisions(api, { batch: true });
      setMessage('Generated decisions across all models (parallel).');
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleResolve(id: string, decision: 'approved' | 'rejected') {
    setError(null);
    try {
      await resolveAutonomousDecision(api, id, decision);
      setMessage(`Decision ${decision}.`);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRollback(actionId: string) {
    setError(null);
    try {
      await rollbackAutonomousAction(api, actionId);
      setMessage('Action rolled back.');
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <Metric title="Pending approvals" value={dashboard?.pendingDecisions ?? pending.length} />
        <Metric title="Blocked actions" value={dashboard?.blockedActions ?? 0} />
        <Metric title="Policies" value={policies.length} />
        <Metric title="Risk alerts" value={dashboard?.riskAlerts.length ?? 0} />
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Risk alerts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(dashboard?.riskAlerts ?? []).map((alert, i) => (
            <Badge key={i} variant={alert.level === 'high' ? 'destructive' : 'secondary'}>
              {alert.message}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Policy configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current mode: <strong>{tenantPolicy?.mode ?? 'semi_autonomous'}</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void handleModeChange('fully_autonomous')}>Fully autonomous</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => void handleModeChange('semi_autonomous')}>Semi-autonomous</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => void handleModeChange('suggestion_only')}>Suggestion only</Button>
            </div>
            <Button type="button" onClick={() => void handleGenerate()}>Generate decisions</Button>
            <ul className="text-xs text-muted-foreground">
              {policies.map((p) => (
                <li key={p.id}>
                  {p.locationId ? `Location override` : 'Tenant default'} — {p.mode}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length ? pending.map((d) => (
              <div key={d.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.actionType}</span>
                  <Badge variant="secondary">{d.modelType}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{d.explanation}</p>
                <p className="text-xs">Confidence: {(Number(d.confidence) * 100).toFixed(0)}%</p>
                <ImpactRow impact={d.predictedImpact} />
                {d.alternativesConsidered.length ? (
                  <p className="mt-1 text-xs text-muted-foreground">{d.alternativesConsidered.length} alternative(s) considered</p>
                ) : null}
                <div className="mt-2 flex gap-2">
                  <Button type="button" size="sm" onClick={() => void handleResolve(d.id, 'approved')}>Approve</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => void handleResolve(d.id, 'rejected')}>Reject</Button>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No pending decisions.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Action history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>When</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.actionType}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'failed' || row.status === 'blocked' ? 'destructive' : 'secondary'}>{row.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(row.createdAt)}</TableCell>
                  <TableCell>
                    {row.status === 'succeeded' ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => void handleRollback(row.id)}>Undo</Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ImpactRow({ impact }: { impact: Record<string, number> }) {
  const keys = ['revenue', 'margin', 'stockouts', 'laborCost', 'deliveryMinutes'];
  const parts = keys.filter((k) => impact[k] !== undefined).map((k) => `${k} ${impact[k]! > 0 ? '+' : ''}${impact[k]}%`);
  if (!parts.length) return null;
  return <p className="text-xs text-muted-foreground">Predicted impact: {parts.join(' · ')}</p>;
}
