'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  listReplenishmentActions,
  listReplenishmentRules,
  runReplenishment,
  saveReplenishmentRule,
  type ReplenishmentAction,
  type ReplenishmentRule,
  type ReplenishmentRun,
} from '@/lib/api/admin/replenishment';
import { getErrorMessage } from '@/lib/utils';

const ruleTypes = ['min_max', 'forecast_based', 'safety_stock'] as const;

export function ReplenishmentDashboardPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [rules, setRules] = useState<ReplenishmentRule[]>([]);
  const [actions, setActions] = useState<ReplenishmentAction[]>([]);
  const [lastRun, setLastRun] = useState<ReplenishmentRun | null>(null);
  const [locationId, setLocationId] = useState('');
  const [itemId, setItemId] = useState('');
  const [ruleType, setRuleType] = useState<typeof ruleTypes[number]>('forecast_based');
  const [minLevel, setMinLevel] = useState('');
  const [maxLevel, setMaxLevel] = useState('');
  const [safetyStock, setSafetyStock] = useState('');
  const [reorderMultiple, setReorderMultiple] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [nextRules, nextActions] = await Promise.all([
        listReplenishmentRules(api),
        listReplenishmentActions(api),
      ]);
      setRules(nextRules);
      setActions(nextActions);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<void>) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveRule() {
    await run(async () => {
      await saveReplenishmentRule(api, {
        locationId,
        itemId,
        ruleType,
        minLevel: minLevel ? Number(minLevel) : undefined,
        maxLevel: maxLevel ? Number(maxLevel) : undefined,
        safetyStock: safetyStock ? Number(safetyStock) : undefined,
        reorderMultiple: reorderMultiple ? Number(reorderMultiple) : undefined,
        supplierId: supplierId || undefined,
        sourceLocationId: sourceLocationId || undefined,
        isActive: true,
      });
      setMessage('Replenishment rule saved');
    });
  }

  async function runEngine(dryRun = false) {
    await run(async () => {
      const result = await runReplenishment(api, {
        locationId: locationId || undefined,
        itemId: itemId || undefined,
        dryRun,
      });
      setLastRun(result);
      setMessage(dryRun ? 'Dry run complete' : 'Replenishment run complete');
    });
  }

  const pending = actions.filter((action) => action.status === 'pending');
  const completed = actions.filter((action) => action.status === 'completed');
  const failed = actions.filter((action) => action.status === 'failed');
  const poCount = actions.filter((action) => action.actionType === 'create_po').length;
  const transferCount = actions.filter((action) => action.actionType === 'create_transfer').length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="Active rules" value={rules.filter((rule) => rule.isActive).length.toString()} />
        <Metric label="Pending actions" value={pending.length.toString()} />
        <Metric label="Auto POs" value={poCount.toString()} />
        <Metric label="Auto transfers" value={transferCount.toString()} />
        <Metric label="Failed actions" value={failed.length.toString()} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rule editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Location UUID" value={locationId} onChange={(event) => setLocationId(event.target.value)} />
            <Input placeholder="Item/Product UUID" value={itemId} onChange={(event) => setItemId(event.target.value)} />
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={ruleType}
              onChange={(event) => setRuleType(event.target.value as typeof ruleTypes[number])}
            >
              {ruleTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <Input type="number" placeholder="Min level" value={minLevel} onChange={(event) => setMinLevel(event.target.value)} />
              <Input type="number" placeholder="Max level" value={maxLevel} onChange={(event) => setMaxLevel(event.target.value)} />
              <Input type="number" placeholder="Safety stock" value={safetyStock} onChange={(event) => setSafetyStock(event.target.value)} />
              <Input type="number" placeholder="Reorder multiple" value={reorderMultiple} onChange={(event) => setReorderMultiple(event.target.value)} />
            </div>
            <Input placeholder="Supplier UUID (optional)" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} />
            <Input placeholder="Warehouse/source location UUID (optional)" value={sourceLocationId} onChange={(event) => setSourceLocationId(event.target.value)} />
            <Button type="button" disabled={loading || !locationId || !itemId} onClick={saveRule}>
              Save rule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Automation run</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Run replenishment against active rules. Dry run previews actions without creating PO or transfer records.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={loading} onClick={() => void runEngine(true)}>
                Dry run
              </Button>
              <Button type="button" disabled={loading} onClick={() => void runEngine(false)}>
                Run automation
              </Button>
              <Button type="button" variant="outline" disabled={loading} onClick={() => void load()}>
                Refresh
              </Button>
            </div>
            {lastRun ? (
              <div className="rounded-md border p-3 text-sm">
                <p>Evaluated rules: {lastRun.evaluatedRules}</p>
                <p>Created actions: {lastRun.createdActions}</p>
                <p>Stockouts prevented: {String(lastRun.analytics.stockoutsPrevented ?? 0)}</p>
                <p>Replenishment cost: {String(lastRun.analytics.replenishmentCost ?? '0.00')}</p>
              </div>
            ) : null}
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Action log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Linked record</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.slice(0, 25).map((action) => (
                <TableRow key={action.id}>
                  <TableCell><Badge>{action.status}</Badge></TableCell>
                  <TableCell>{action.actionType}</TableCell>
                  <TableCell>{action.quantity}</TableCell>
                  <TableCell>{action.locationId.slice(0, 8)}</TableCell>
                  <TableCell>{action.purchaseOrderId ?? action.stockTransferId ?? action.pickTaskId ?? '-'}</TableCell>
                  <TableCell>{action.reason ?? action.error ?? '-'}</TableCell>
                </TableRow>
              ))}
              {!actions.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">No replenishment actions yet.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Min/Max</TableHead>
                <TableHead>Safety</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.slice(0, 25).map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.ruleType}</TableCell>
                  <TableCell>{rule.locationId.slice(0, 8)}</TableCell>
                  <TableCell>{rule.itemId.slice(0, 8)}</TableCell>
                  <TableCell>{rule.minLevel ?? '-'} / {rule.maxLevel ?? '-'}</TableCell>
                  <TableCell>{rule.safetyStock ?? '-'}</TableCell>
                  <TableCell><Badge>{rule.isActive ? 'active' : 'inactive'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {completed.length ? <p className="mt-3 text-sm text-muted-foreground">{completed.length} completed replenishment actions in the log.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
