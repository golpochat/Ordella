'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useEffect, useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from '@shared-ui';
import { fetchLocations, updateLocation, type LocationListItem } from '@/lib/api/locations';
import {
  fetchRoutingDecisions,
  fetchRoutingRules,
  saveRoutingRule,
  type RoutingDecision,
  type RoutingRule,
} from '@/lib/api/admin/routing';
import { getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

import { PanelEmpty } from '@/components/ui/admin-empty-state';

const ruleTypes: RoutingRule['ruleType'][] = ['distance', 'stock', 'capacity', 'priority', 'delivery_zone'];

export function OrderRoutingPanel() {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const { formatDateTime, formatNumber } = useTenantSettings();
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [decisions, setDecisions] = useState<RoutingDecision[]>([]);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [ruleType, setRuleType] = useState<RoutingRule['ruleType']>('priority');
  const [ruleJson, setRuleJson] = useState('{"weight":10}');
  const [locationId, setLocationId] = useState('');
  const [priority, setPriority] = useState('0');
  const [capacity, setCapacity] = useState('20');
  const [zonesJson, setZonesJson] = useState('[]');
  const [supportsDelivery, setSupportsDelivery] = useState(true);
  const [supportsPickup, setSupportsPickup] = useState(true);
    const [loading, setLoading] = useState(false);

  useEffect(() => {

    void load();
  }, []);

  const activeRules = useMemo(() => rules.filter((rule) => rule.isActive), [rules]);

  async function load() {
    setLoading(true);
    try {
      const [nextRules, nextDecisions, nextLocations] = await Promise.all([
        fetchRoutingRules(),
        fetchRoutingDecisions(),
        fetchLocations(),
      ]);
      setRules(nextRules);
      setDecisions(nextDecisions);
      setLocations(nextLocations);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveRule() {
    try {
      await saveRoutingRule({
        ruleType,
        value: JSON.parse(ruleJson) as Record<string, unknown>,
        isActive: true,
      });
      toastSuccess('Routing rule saved');
      await load();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function saveLocationRouting() {
    if (!locationId.trim()) {
      toastError('Location ID is required');
      return;
    }
    try {
      await updateLocation(locationId.trim(), {
        routingPriority: Number(priority),
        fulfillmentCapacity: Number(capacity),
        deliveryZones: JSON.parse(zonesJson) as unknown[],
        supportsDelivery,
        supportsPickup,
      });
      toastSuccess('Location routing settings saved');
      await load();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <MetricGrid columns={4}>
        <Metric label="Active rules" value={formatNumber(activeRules.length)} />
        <Metric label="Decisions logged" value={formatNumber(decisions.length)} />
        <Metric label="Delivery locations" value={formatNumber(locations.filter((location) => location.supportsDelivery).length)} />
        <Metric label="Zone-enabled locations" value={formatNumber(locations.filter((location) => (location.deliveryZones?.length ?? 0) > 0).length)} />
      </MetricGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Routing rule editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2 text-sm font-medium">
              Rule type
              <Select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={ruleType}
                onChange={(event) => setRuleType(event.target.value as RoutingRule['ruleType'])}
              >
                {ruleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Rule JSON
              <Textarea
                className="min-h-28 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
                value={ruleJson}
                onChange={(event) => setRuleJson(event.target.value)}
              />
            </label>
            <Button onClick={saveRule}>Save rule</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location routing settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Location UUID" value={locationId} onChange={(event) => setLocationId(event.target.value)} />
            <Input type="number" min={0} value={priority} onChange={(event) => setPriority(event.target.value)} placeholder="Routing priority" />
            <Input type="number" min={1} value={capacity} onChange={(event) => setCapacity(event.target.value)} placeholder="Fulfillment capacity per hour" />
            <Textarea
              className="min-h-24 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
              value={zonesJson}
              onChange={(event) => setZonesJson(event.target.value)}
              placeholder='["NW1","Downtown"]'
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={supportsDelivery} onChange={(event) => setSupportsDelivery(event.target.checked)} />
              Supports delivery
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={supportsPickup} onChange={(event) => setSupportsPickup(event.target.checked)} />
              Supports pickup
            </label>
            <Button onClick={saveLocationRouting}>Save location routing</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent routing decisions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {decisions.slice(0, 8).map((decision) => (
            <div key={decision.id} className="rounded-md border p-3 text-sm">
              <div className="font-medium">{decision.toLocation?.name ?? decision.toLocationId ?? 'No eligible location'}</div>
              <div className="text-muted-foreground">{decision.reason}</div>
              <div className="text-xs text-muted-foreground">
                ETA {decision.estimatedDeliveryMinutes ?? 'n/a'} min · {formatDateTime(decision.createdAt)}
              </div>
            </div>
          ))}
          {!decisions.length ? <PanelEmpty title="No routing decisions yet" description="Content will appear here when available." /> : null}
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

