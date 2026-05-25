'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { fetchLocations, updateLocation, type LocationListItem } from '@/lib/api/locations';
import {
  fetchRoutingDecisions,
  fetchRoutingRules,
  saveRoutingRule,
  type RoutingDecision,
  type RoutingRule,
} from '@/lib/api/admin/routing';
import { getErrorMessage } from '@/lib/utils';

const ruleTypes: RoutingRule['ruleType'][] = ['distance', 'stock', 'capacity', 'priority', 'delivery_zone'];

export function OrderRoutingPanel() {
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  const activeRules = useMemo(() => rules.filter((rule) => rule.isActive), [rules]);

  async function load() {
    setLoading(true);
    setError(null);
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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveRule() {
    setMessage(null);
    setError(null);
    try {
      await saveRoutingRule({
        ruleType,
        value: JSON.parse(ruleJson) as Record<string, unknown>,
        isActive: true,
      });
      setMessage('Routing rule saved');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function saveLocationRouting() {
    if (!locationId.trim()) {
      setError('Location ID is required');
      return;
    }
    setMessage(null);
    setError(null);
    try {
      await updateLocation(locationId.trim(), {
        routingPriority: Number(priority),
        fulfillmentCapacity: Number(capacity),
        deliveryZones: JSON.parse(zonesJson) as unknown[],
        supportsDelivery,
        supportsPickup,
      });
      setMessage('Location routing settings saved');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order routing dashboard</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Metric label="Active rules" value={activeRules.length.toString()} />
          <Metric label="Decisions logged" value={decisions.length.toString()} />
          <Metric label="Delivery locations" value={locations.filter((location) => location.supportsDelivery).length.toString()} />
          <Metric label="Zone-enabled locations" value={locations.filter((location) => (location.deliveryZones?.length ?? 0) > 0).length.toString()} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Routing rule editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2 text-sm font-medium">
              Rule type
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={ruleType}
                onChange={(event) => setRuleType(event.target.value as RoutingRule['ruleType'])}
              >
                {ruleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Rule JSON
              <textarea
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
            <textarea
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
                ETA {decision.estimatedDeliveryMinutes ?? 'n/a'} min · {new Date(decision.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {!decisions.length ? <p className="text-sm text-muted-foreground">No routing decisions yet.</p> : null}
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
