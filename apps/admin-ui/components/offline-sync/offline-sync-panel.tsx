'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import {
  forceOfflineSync,
  listOfflineConflicts,
  listOfflineLogs,
  resolveOfflineConflict,
  updateOfflineSetting,
  type OfflineLocationSetting,
  type OfflineSyncConflict,
  type OfflineSyncDashboard,
  type OfflineSyncLog,
} from '@/lib/api/admin/offline-sync';
import { formatDate, getErrorMessage } from '@/lib/utils';

type OfflineSyncPanelProps = {
  dashboard: OfflineSyncDashboard | null;
  settings: OfflineLocationSetting[];
  logs: OfflineSyncLog[];
  conflicts: OfflineSyncConflict[];
  locations: LocationListItem[];
};

export function OfflineSyncPanel({
  dashboard,
  settings: initialSettings,
  logs: initialLogs,
  conflicts: initialConflicts,
  locations: initialLocations,
}: OfflineSyncPanelProps) {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [locations, setLocations] = useState(initialLocations);
  const [settings, setSettings] = useState(initialSettings);
  const [logs, setLogs] = useState(initialLogs);
  const [conflicts, setConflicts] = useState(initialConflicts);
  const [locationId, setLocationId] = useState(initialLocations[0]?.id ?? initialSettings[0]?.locationId ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSetting = settings.find((setting) => setting.locationId === locationId) ?? settings[0] ?? null;

  async function refreshLocationData(nextLocationId = locationId) {
    setError(null);
    try {
      const [nextLogs, nextConflicts] = await Promise.all([
        listOfflineLogs(api, nextLocationId || undefined),
        listOfflineConflicts(api, nextLocationId || undefined),
      ]);
      setLogs(nextLogs);
      setConflicts(nextConflicts);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function saveSetting(setting: OfflineLocationSetting, patch: Partial<OfflineLocationSetting>) {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateOfflineSetting(api, {
        locationId: setting.locationId,
        offlineModeEnabled: patch.offlineModeEnabled ?? setting.offlineModeEnabled,
        allowPosSales: patch.allowPosSales ?? setting.allowPosSales,
        allowWarehouseOps: patch.allowWarehouseOps ?? setting.allowWarehouseOps,
        allowDeliveryOps: patch.allowDeliveryOps ?? setting.allowDeliveryOps,
        allowKioskOrders: patch.allowKioskOrders ?? setting.allowKioskOrders,
        requireDeviceBinding: patch.requireDeviceBinding ?? setting.requireDeviceBinding,
        maxOfflineMinutes: patch.maxOfflineMinutes ?? setting.maxOfflineMinutes,
        deltaRetentionDays: patch.deltaRetentionDays ?? setting.deltaRetentionDays,
        policy: setting.policy,
      });
      setSettings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage('Offline sync controls saved.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function runForceSync() {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await forceOfflineSync(api, locationId);
      setMessage(`Force sync processed ${result.processed} operation(s).`);
      await refreshLocationData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resolveConflict(conflict: OfflineSyncConflict, outcome: 'server_wins' | 'client_wins' | 'dismissed') {
    setError(null);
    try {
      const updated = await resolveOfflineConflict(api, conflict.id, outcome);
      setConflicts((current) => current.filter((item) => item.id !== updated.id));
      setMessage(`Conflict resolved with ${outcome.replaceAll('_', ' ')}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function loadLocationsIfNeeded() {
    if (locations.length) return;
    try {
      const rows = await fetchLocations();
      setLocations(rows);
      setLocationId((current) => current || rows[0]?.id || '');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6" onFocus={() => void loadLocationsIfNeeded()}>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric title="Pending actions" value={dashboard?.pendingActions ?? 0} />
        <Metric title="Open conflicts" value={dashboard?.openConflicts ?? conflicts.length} />
        <Metric title="Failed attempts" value={dashboard?.failedAttempts ?? 0} />
        <Metric title="Edge devices" value={dashboard?.devices.length ?? 0} />
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Location Offline Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={locationId}
              onChange={(event) => {
                setLocationId(event.target.value);
                void refreshLocationData(event.target.value);
              }}
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
              {!locations.length && selectedSetting ? <option value={selectedSetting.locationId}>{selectedSetting.locationId}</option> : null}
            </select>
            <Button type="button" onClick={() => void runForceSync()} disabled={loading || !locationId}>
              Force sync
            </Button>
          </div>

          {selectedSetting ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Toggle label="Offline mode" checked={selectedSetting.offlineModeEnabled} onChange={(value) => void saveSetting(selectedSetting, { offlineModeEnabled: value })} />
              <Toggle label="POS sales" checked={selectedSetting.allowPosSales} onChange={(value) => void saveSetting(selectedSetting, { allowPosSales: value })} />
              <Toggle label="Warehouse ops" checked={selectedSetting.allowWarehouseOps} onChange={(value) => void saveSetting(selectedSetting, { allowWarehouseOps: value })} />
              <Toggle label="Delivery ops" checked={selectedSetting.allowDeliveryOps} onChange={(value) => void saveSetting(selectedSetting, { allowDeliveryOps: value })} />
              <Toggle label="Kiosk orders" checked={selectedSetting.allowKioskOrders} onChange={(value) => void saveSetting(selectedSetting, { allowKioskOrders: value })} />
              <Toggle label="Device binding" checked={selectedSetting.requireDeviceBinding} onChange={(value) => void saveSetting(selectedSetting, { requireDeviceBinding: value })} />
              <NumberSetting label="Max offline minutes" value={selectedSetting.maxOfflineMinutes} onSave={(value) => void saveSetting(selectedSetting, { maxOfflineMinutes: value })} />
              <NumberSetting label="Delta retention days" value={selectedSetting.deltaRetentionDays} onSave={(value) => void saveSetting(selectedSetting, { deltaRetentionDays: value })} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No offline settings are available yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conflict Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conflict</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Resolve</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conflicts.map((conflict) => (
                  <TableRow key={conflict.id}>
                    <TableCell>
                      <p className="font-medium">{label(conflict.conflictType)}</p>
                      <p className="text-xs text-muted-foreground">{conflict.entityType} · {formatDate(conflict.createdAt)}</p>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{label(conflict.resolutionStrategy)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" onClick={() => void resolveConflict(conflict, 'server_wins')}>Server</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => void resolveConflict(conflict, 'client_wins')}>Client</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => void resolveConflict(conflict, 'dismissed')}>Dismiss</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!conflicts.length ? <p className="mt-3 text-sm text-muted-foreground">No open conflicts for this location.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edge Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dashboard?.devices ?? []).map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.displayName}</TableCell>
                    <TableCell>{device.deviceType}</TableCell>
                    <TableCell><Badge variant={device.status === 'active' ? 'secondary' : 'destructive'}>{device.status}</Badge></TableCell>
                    <TableCell>{device.lastSeenAt ? formatDate(device.lastSeenAt) : 'Never'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!(dashboard?.devices.length) ? <p className="mt-3 text-sm text-muted-foreground">No edge devices have been bound yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Offline Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{label(log.eventType)}</TableCell>
                  <TableCell><Badge variant={log.level === 'error' ? 'destructive' : 'outline'}>{log.level}</Badge></TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>{formatDate(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!logs.length ? <p className="mt-3 text-sm text-muted-foreground">No offline sync logs yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Toggle({ label: text, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {text}
    </label>
  );
}

function NumberSetting({ label: text, value, onSave }: { label: string; value: number; onSave: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  return (
    <div className="space-y-2 rounded-md border p-3">
      <label className="text-sm font-medium">{text}</label>
      <div className="flex gap-2">
        <Input type="number" min={1} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button type="button" variant="outline" onClick={() => onSave(Number(draft) || value)}>
          Save
        </Button>
      </div>
    </div>
  );
}

function label(value: string) {
  return value.replaceAll('_', ' ').replaceAll('-', ' ');
}
