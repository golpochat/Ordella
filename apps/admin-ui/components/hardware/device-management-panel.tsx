'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack, Textarea } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  dispatchHardwareCommand,
  listHardwareDeviceLogs,
  registerHardwareDevice,
  updateHardwareDevice,
  type HardwareDevice,
  type HardwareDeviceLog,
  type HardwareSummary,
} from '@/lib/api/admin/hardware';
import type { LocationListItem } from '@/lib/api/locations';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';
import { ConfirmDialog } from '@/components/ui/admin-dialog';

const DEVICE_TYPES = [
  'receipt_printer',
  'label_printer',
  'barcode_scanner',
  'scale',
  'cash_drawer',
  'kiosk',
  'kds_screen',
  'temperature_sensor',
  'humidity_sensor',
  'door_sensor',
  'shelf_weight_sensor',
];

const COMMANDS = ['print_receipt', 'print_label', 'open_cash_drawer', 'scan_barcode', 'read_weight', 'kiosk_refresh', 'firmware_update', 'ping'];

export function DeviceManagementPanel({
  initialDevices,
  initialSummary,
  locations,
}: {
  initialDevices: HardwareDevice[];
  initialSummary: HardwareSummary;
  locations: LocationListItem[];
}) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const [devices, setDevices] = useState(initialDevices);
  const [summary, setSummary] = useState(initialSummary);
  const [logs, setLogs] = useState<HardwareDeviceLog[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(initialDevices[0]?.id ?? '');
  const [filter, setFilter] = useState({ locationId: 'all', deviceType: 'all', status: 'all' });
  const [form, setForm] = useState({
    deviceId: '',
    displayName: '',
    deviceType: 'receipt_printer',
    locationId: locations[0]?.id ?? '',
    firmwareVersion: '',
    ip: '',
    port: '',
    protocol: 'network',
    supportsEncryption: false,
  });
  const [commandType, setCommandType] = useState('ping');
  const [commandPayload, setCommandPayload] = useState('{}');
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [flagErrorTarget, setFlagErrorTarget] = useState<HardwareDevice | null>(null);
  const [flagErrorLoading, setFlagErrorLoading] = useState(false);
    const locationNameById = useMemo(() => new Map(locations.map((location) => [location.id, location.name])), [locations]);
  const selectedDevice = devices.find((device) => device.id === selectedDeviceId);
  const visibleDevices = devices.filter((device) => {

    const locationMatches = filter.locationId === 'all' || device.locationId === filter.locationId;
    const typeMatches = filter.deviceType === 'all' || device.deviceType === filter.deviceType;
    const statusMatches = filter.status === 'all' || device.status === filter.status;
    return locationMatches && typeMatches && statusMatches;
  });

  async function register(event: React.FormEvent) {
    event.preventDefault();
    try {
      const device = await registerHardwareDevice(createBrowserApiClient(), {
        deviceId: form.deviceId,
        displayName: form.displayName,
        deviceType: form.deviceType,
        locationId: form.locationId,
        firmwareVersion: form.firmwareVersion || undefined,
        supportsEncryption: form.supportsEncryption,
        config: {
          ip: form.ip || null,
          port: form.port ? Number(form.port) : null,
          protocol: form.protocol,
        },
      });
      setDevices((current) => [device, ...current]);
      setSummary((current) => ({ ...current, total: current.total + 1, offline: current.offline + 1 }));
      setSelectedDeviceId(device.id);
      setRevealedToken(device.authToken ?? null);
      toastSuccess('Device registered');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const device = await updateHardwareDevice(createBrowserApiClient(), id, { status });
      setDevices((current) => current.map((item) => (item.id === id ? device : item)));
      toastSuccess(`Device marked ${status}`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function confirmFlagError() {
    if (!flagErrorTarget) return;
    setFlagErrorLoading(true);
    try {
      await updateStatus(flagErrorTarget.id, 'error');
      setFlagErrorTarget(null);
    } finally {
      setFlagErrorLoading(false);
    }
  }

  async function loadLogs(id: string) {
    setSelectedDeviceId(id);
    try {
      setLogs(await listHardwareDeviceLogs(createBrowserApiClient(), id));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function dispatchCommand() {
    if (!selectedDevice) return;
    try {
      const payload = JSON.parse(commandPayload) as Record<string, unknown>;
      const command = await dispatchHardwareCommand(createBrowserApiClient(), selectedDevice.id, { commandType, payload });
      toastSuccess(`Command queued: ${command.commandType}`);
      await loadLogs(selectedDevice.id);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <ConfirmDialog
        open={!!flagErrorTarget}
        onOpenChange={(open) => {
          if (!open) setFlagErrorTarget(null);
        }}
        title={flagErrorTarget ? `Flag "${flagErrorTarget.displayName}" as error?` : 'Flag device as error?'}
        description="Alerts and monitoring will treat this device as failed until marked online again."
        confirmLabel="Flag error"
        destructive={false}
        loading={flagErrorLoading}
        onConfirm={confirmFlagError}
      />
      {revealedToken ? (
        <div className="rounded-md border bg-muted/40 p-3">
          <p className="text-sm font-medium">Device token shown once</p>
          <code className="mt-2 block break-all text-sm">{revealedToken}</code>
        </div>
      ) : null}

      <MetricGrid columns={4}>
        <MetricCard title="Total devices" value={String(summary.total)} detail="Registered hardware" />
        <MetricCard title="Online" value={String(summary.online)} detail="Heartbeat within window" />
        <MetricCard title="Offline" value={String(summary.offline)} detail="Needs attention" />
        <MetricCard title="Errors" value={String(summary.error)} detail="Fault state" />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle>Register Device</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-4" onSubmit={register}>
            <Input placeholder="Device ID / serial" value={form.deviceId} onChange={(event) => setForm((current) => ({ ...current, deviceId: event.target.value }))} required />
            <Input placeholder="Display name" value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} required />
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={form.deviceType} onChange={(event) => setForm((current) => ({ ...current, deviceType: event.target.value }))}>
              {DEVICE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </Select>
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={form.locationId} onChange={(event) => setForm((current) => ({ ...current, locationId: event.target.value }))}>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </Select>
            <Input placeholder="Firmware version" value={form.firmwareVersion} onChange={(event) => setForm((current) => ({ ...current, firmwareVersion: event.target.value }))} />
            <Input placeholder="IP / host" value={form.ip} onChange={(event) => setForm((current) => ({ ...current, ip: event.target.value }))} />
            <Input placeholder="Port" value={form.port} onChange={(event) => setForm((current) => ({ ...current, port: event.target.value }))} />
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={form.protocol} onChange={(event) => setForm((current) => ({ ...current, protocol: event.target.value }))}>
              <option value="escpos">ESC/POS</option>
              <option value="network">Network</option>
              <option value="usb">USB</option>
              <option value="bluetooth">Bluetooth</option>
              <option value="ble">BLE</option>
              <option value="serial">Serial</option>
              <option value="mqtt">MQTT</option>
              <option value="websocket">WebSocket</option>
            </Select>
            <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input type="checkbox" checked={form.supportsEncryption} onChange={(event) => setForm((current) => ({ ...current, supportsEncryption: event.target.checked }))} />
              Encrypted transport
            </label>
            <Button type="submit">Register device</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Fleet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={filter.locationId} onChange={(event) => setFilter((current) => ({ ...current, locationId: event.target.value }))}>
              <option value="all">All locations</option>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </Select>
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={filter.deviceType} onChange={(event) => setFilter((current) => ({ ...current, deviceType: event.target.value }))}>
              <option value="all">All types</option>
              {DEVICE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </Select>
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={filter.status} onChange={(event) => setFilter((current) => ({ ...current, status: event.target.value }))}>
              <option value="all">All statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="error">Error</option>
            </Select>
          </div>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Firmware</TableHead>
                <TableHead>Last heartbeat</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {visibleDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <p className="font-medium">{device.displayName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{device.deviceId}</p>
                  </TableCell>
                  <TableCell>{device.deviceType}</TableCell>
                  <TableCell>{locationNameById.get(device.locationId) ?? device.locationId}</TableCell>
                  <TableCell><Tag variant={device.status === 'error' ? 'error' : 'outline'}><TagLabel>{device.status}</TagLabel></Tag></TableCell>
                  <TableCell>{device.firmwareVersion ?? 'n/a'}</TableCell>
                  <TableCell>{formatDate(device.lastHeartbeatAt ?? undefined)}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => void loadLogs(device.id)}>Logs</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void updateStatus(device.id, 'online')}>Mark online</Button>
                    <Button type="button" size="sm" variant="error" onClick={() => setFlagErrorTarget(device)}>Flag error</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Command Dispatch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={selectedDeviceId} onChange={(event) => setSelectedDeviceId(event.target.value)}>
              {devices.map((device) => <option key={device.id} value={device.id}>{device.displayName}</option>)}
            </Select>
            <Select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={commandType} onChange={(event) => setCommandType(event.target.value)}>
              {COMMANDS.map((command) => <option key={command} value={command}>{command}</option>)}
            </Select>
            <Textarea className="min-h-28 w-full rounded-md border bg-background p-3 font-mono text-xs" value={commandPayload} onChange={(event) => setCommandPayload(event.target.value)} />
            <Button type="button" onClick={() => void dispatchCommand()} disabled={!selectedDevice}>Send command</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {logs.length ? logs.map((log) => (
              <div key={log.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{log.action}</p>
                  <Tag variant={log.level === 'error' ? 'error' : 'outline'}><TagLabel>{log.level}</TagLabel></Tag>
                </div>
                <p className="text-muted-foreground">{log.message ?? 'No message'}</p>
                <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">Select a device to view recent logs.</p>}
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}

