'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  approveSuggestedPurchaseOrder,
  generatePurchaseOrderSuggestions,
  getReplenishmentDashboard,
  listReplenishmentActions,
  listReplenishmentRules,
  runReplenishment,
  saveReplenishmentRule,
  type ReplenishmentDashboard,
  type ReplenishmentAction,
  type ReplenishmentRule,
  type ReplenishmentRun,
} from '@/lib/api/admin/replenishment';
import type { PurchaseOrder } from '@/lib/api/admin/procurement';
import { getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

import { PanelEmpty } from '@/components/ui/admin-empty-state';

const ruleTypes = ['min_max', 'forecast_based', 'safety_stock'] as const;

export function ReplenishmentDashboardPanel() {
  const { success: toastSuccess, error: toastError } = useAdminToast();
  const api = useMemo(() => createBrowserApiClient(), []);
  const [rules, setRules] = useState<ReplenishmentRule[]>([]);
  const [actions, setActions] = useState<ReplenishmentAction[]>([]);
  const [dashboard, setDashboard] = useState<ReplenishmentDashboard | null>(null);
  const [lastRun, setLastRun] = useState<ReplenishmentRun | null>(null);
  const [locationId, setLocationId] = useState('');
  const [itemId, setItemId] = useState('');
  const [horizonDays, setHorizonDays] = useState('14');
  const [riskWindowDays, setRiskWindowDays] = useState('7');
  const [ruleType, setRuleType] = useState<typeof ruleTypes[number]>('forecast_based');
  const [minLevel, setMinLevel] = useState('');
  const [maxLevel, setMaxLevel] = useState('');
  const [safetyStock, setSafetyStock] = useState('');
  const [reorderMultiple, setReorderMultiple] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [draftQuantities, setDraftQuantities] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {

    try {
      const dashboardParams = {
        locationId: locationId || undefined,
        horizonDays: Number(horizonDays || 14),
        riskWindowDays: Number(riskWindowDays || 7),
      };
      const [nextRules, nextActions, nextDashboard] = await Promise.all([
        listReplenishmentRules(api),
        listReplenishmentActions(api),
        getReplenishmentDashboard(api, dashboardParams),
      ]);
      setRules(nextRules);
      setActions(nextActions);
      setDashboard(nextDashboard);
      setDraftQuantities((current) => ({
        ...Object.fromEntries(nextDashboard.draftPurchaseOrders.map((order) => [
          order.id,
          Object.fromEntries(order.items.map((item) => [item.itemId, String(item.quantityOrdered)])),
        ])),
        ...current,
      }));
      } catch (err) {
      toastError(getErrorMessage(err));
    }
  }, [api, horizonDays, locationId, riskWindowDays]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<void>) {
    setLoading(true);
    try {
      await action();
      await load();
    } catch (err) {
      toastError(getErrorMessage(err));
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
      toastSuccess('Replenishment rule saved');
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
      toastSuccess(dryRun ? 'Dry run complete' : 'Replenishment run complete');
    });
  }

  async function generateDraftPurchaseOrders(dryRun = false) {
    await run(async () => {
      const result = await generatePurchaseOrderSuggestions(api, {
        locationId: locationId || undefined,
        horizonDays: Number(horizonDays || 14),
        riskWindowDays: Number(riskWindowDays || 7),
        dryRun,
      });
      toastSuccess(dryRun
        ? `${result.suggestions.length} purchase order suggestions ready for review`
        : `${result.purchaseOrders.length} draft purchase orders generated`);
    });
  }

  function setDraftQuantity(orderId: string, itemId: string, quantity: string) {
    setDraftQuantities((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] ?? {}),
        [itemId]: quantity,
      },
    }));
  }

  async function approveDraft(order: PurchaseOrder) {
    await run(async () => {
      await approveSuggestedPurchaseOrder(api, {
        purchaseOrderId: order.id,
        items: order.items.map((item) => ({
          itemId: item.itemId,
          quantityOrdered: Math.max(1, Number(draftQuantities[order.id]?.[item.itemId] ?? item.quantityOrdered)),
          costPrice: Number(item.costPrice),
        })),
      });
      toastSuccess(`Purchase order ${order.id.slice(0, 8)} sent to supplier`);
    });
  }

  const pending = actions.filter((action) => action.status === 'pending');
  const completed = actions.filter((action) => action.status === 'completed');
  const failed = actions.filter((action) => action.status === 'failed');
  const poCount = actions.filter((action) => action.actionType === 'create_po').length;
  const transferCount = actions.filter((action) => action.actionType === 'create_transfer').length;
  const lowStockItems = dashboard?.lowStockItems ?? [];
  const suggestedPurchaseOrders = dashboard?.suggestedPurchaseOrders ?? [];
  const draftPurchaseOrders = dashboard?.draftPurchaseOrders ?? [];

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={5}>
        <Metric label="Low stock" value={String(dashboard?.metrics.lowStockItems ?? 0)} />
        <Metric label="Stock-out risk" value={String(dashboard?.metrics.stockoutRiskItems ?? 0)} />
        <Metric label="Overstock alerts" value={String(dashboard?.metrics.overstockedItems ?? 0)} />
        <Metric label="Suggested POs" value={String(dashboard?.metrics.suggestedPurchaseOrders ?? 0)} />
        <Metric label="Suggested value" value={`$${dashboard?.metrics.suggestedValue ?? '0.00'}`} />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Forecast-driven replenishment controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input placeholder="Location UUID filter" value={locationId} onChange={(event) => setLocationId(event.target.value)} />
          <Input placeholder="Item/Product UUID" value={itemId} onChange={(event) => setItemId(event.target.value)} />
          <Input type="number" placeholder="Forecast horizon days" value={horizonDays} onChange={(event) => setHorizonDays(event.target.value)} />
          <Input type="number" placeholder="Risk window days" value={riskWindowDays} onChange={(event) => setRiskWindowDays(event.target.value)} />
          <Button type="button" variant="outline" disabled={loading} onClick={() => void load()}>
            Refresh dashboard
          </Button>
          </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low stock and stock-out risk</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Depletion</TableHead>
                  <TableHead>Reorder qty</TableHead>
                  <TableHead>Reorder date</TableHead>
                  <TableHead>Supplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {lowStockItems.slice(0, 20).map((item) => (
                  <TableRow key={`${item.locationId}-${item.productId}`}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.productId.slice(0, 8)} at {item.locationId.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell>{item.available.toFixed(2)}</TableCell>
                    <TableCell><Tag variant={item.riskScore >= 70 ? 'error' : 'neutral'}><TagLabel>{item.riskScore}%</TagLabel></Tag></TableCell>
                    <TableCell>{item.forecastedDepletionDate ?? 'No forecast'}</TableCell>
                    <TableCell>{item.recommendedReorderQty}</TableCell>
                    <TableCell>{item.recommendedReorderDate ?? 'Now'}</TableCell>
                    <TableCell>{item.supplierName ?? 'No supplier'}</TableCell>
                  </TableRow>
                ))}
                {!lowStockItems.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <PanelEmpty
                        title="No stock alerts"
                        description="Low-stock and stock-out alerts for the selected window will appear here."
                        size="compact"
                        className="max-w-none border-0 shadow-none"
                      />
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertList
              title="Predicted to run out"
              empty="No stock-out alerts"
              items={(dashboard?.alerts.stockoutRisk ?? []).slice(0, 6).map((item) => `${item.name} runs out ${item.forecastedDepletionDate ?? 'soon'} (${item.riskScore}% risk)`)}
            />
            <AlertList
              title="Overstocked"
              empty="No overstock alerts"
              items={(dashboard?.alerts.overstocked ?? []).slice(0, 6).map((item) => `${item.name} has ${item.available.toFixed(1)} available against ${item.forecastedDemand.toFixed(1)} forecast demand`)}
            />
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              <p>Automation log: {pending.length} pending, {completed.length} completed, {failed.length} failed.</p>
              <p>Created from rules: {poCount} POs, {transferCount} transfers.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Purchase order suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={loading} onClick={() => void generateDraftPurchaseOrders(true)}>
              Preview grouped POs
            </Button>
            <Button type="button" disabled={loading || !suggestedPurchaseOrders.length} onClick={() => void generateDraftPurchaseOrders(false)}>
              Generate draft POs
            </Button>
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            {suggestedPurchaseOrders.map((suggestion) => (
              <div key={`${suggestion.supplierId}-${suggestion.locationId}`} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{suggestion.supplierName ?? 'Supplier'}</p>
                    <p className="text-xs text-muted-foreground">Location {suggestion.locationId.slice(0, 8)} · {suggestion.items.length} items</p>
                  </div>
                  <Tag><TagLabel>${suggestion.estimatedTotal}</TagLabel></Tag>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {suggestion.items.map((item) => (
                    <div key={`${item.locationId}-${item.productId}`} className="flex items-center justify-between gap-3 rounded-md bg-muted/40 p-2">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">Qty {item.recommendedReorderQty} · MOQ {item.minOrderQty} · case {item.caseSize}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                  <span>Cost ${suggestion.estimatedSubtotal}</span>
                  <span>Tax ${suggestion.estimatedTax}</span>
                  <span>Total ${suggestion.estimatedTotal}</span>
                </div>
              </div>
            ))}
          </div>
          {!suggestedPurchaseOrders.length ? <PanelEmpty title="No supplier-backed PO suggestions for this forecast window" description="Content will appear here when available." /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Draft purchase orders ready to send</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {draftPurchaseOrders.map((order) => (
            <div key={order.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{order.supplier?.name ?? 'Supplier'} · PO {order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">Expected {order.expectedDeliveryDate ?? 'TBD'} · Tax ${order.taxTotal ?? '0.00'} · Total ${order.totalCost}</p>
                </div>
                <Button type="button" disabled={loading} onClick={() => void approveDraft(order)}>
                  Approve and send
                </Button>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{item.item?.name ?? item.itemId}</p>
                    <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2">
                      <Input
                        type="number"
                        value={draftQuantities[order.id]?.[item.itemId] ?? String(item.quantityOrdered)}
                        onChange={(event) => setDraftQuantity(order.id, item.itemId, event.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">@ ${item.costPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!draftPurchaseOrders.length ? <PanelEmpty title="No draft purchase orders generated by replenishment yet" description="Content will appear here when available." /> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rule editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={ruleType}
              onChange={(event) => setRuleType(event.target.value as typeof ruleTypes[number])}
            >
              {ruleTypes.map((type) => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </Select>
            <div className="grid gap-3 md:grid-cols-2">
              <Input type="number" placeholder="Min level" value={minLevel} onChange={(event) => setMinLevel(event.target.value)} />
              <Input type="number" placeholder="Max level" value={maxLevel} onChange={(event) => setMaxLevel(event.target.value)} />
              <Input type="number" placeholder="Safety stock" value={safetyStock} onChange={(event) => setSafetyStock(event.target.value)} />
              <Input type="number" placeholder="Reorder multiple / case size" value={reorderMultiple} onChange={(event) => setReorderMultiple(event.target.value)} />
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
            <CardTitle className="text-lg">Rule automation and action log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={loading} onClick={() => void runEngine(true)}>
                Dry run
              </Button>
              <Button type="button" disabled={loading} onClick={() => void runEngine(false)}>
                Run automation
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
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {actions.slice(0, 10).map((action) => (
                  <TableRow key={action.id}>
                    <TableCell><Tag><TagLabel>{action.status}</TagLabel></Tag></TableCell>
                    <TableCell>{action.actionType}</TableCell>
                    <TableCell>{action.quantity}</TableCell>
                    <TableCell>{action.reason ?? action.error ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Rule type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Min/Max</TableHead>
                <TableHead>Safety</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {rules.slice(0, 25).map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.ruleType}</TableCell>
                  <TableCell>{rule.locationId.slice(0, 8)}</TableCell>
                  <TableCell>{rule.itemId.slice(0, 8)}</TableCell>
                  <TableCell>{rule.minLevel ?? '-'} / {rule.maxLevel ?? '-'}</TableCell>
                  <TableCell>{rule.safetyStock ?? '-'}</TableCell>
                  <TableCell><Tag><TagLabel>{rule.isActive ? 'active' : 'inactive'}</TagLabel></Tag></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {completed.length ? <p className="mt-3 text-sm text-muted-foreground">{completed.length} completed replenishment actions in the log.</p> : null}
        </CardContent>
      </Card>
    </Stack>
  );
}


function AlertList({ title, empty, items }: { title: string; empty: string; items: string[] }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="rounded-md bg-muted/40 p-2 text-sm text-muted-foreground">{item}</p>
        ))}
        {!items.length ? <p className="text-sm text-muted-foreground">{empty}</p> : null}
      </div>
    </div>
  );
}
