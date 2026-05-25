'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import { getLocationSettings, updatePosSettings } from '@/lib/api/admin/settings';
import { getErrorMessage } from '@/lib/utils';

type OfflineModeSettings = {
  enabled: boolean;
  allowOfflineCardPayments: boolean;
  allowOutOfStockOfflineSales: boolean;
  allowUnknownStockOfflineSales: boolean;
  maxOfflineDurationMinutes: number;
  autoSyncIntervalSeconds: number;
};

const DEFAULT_SETTINGS: OfflineModeSettings = {
  enabled: true,
  allowOfflineCardPayments: false,
  allowOutOfStockOfflineSales: false,
  allowUnknownStockOfflineSales: true,
  maxOfflineDurationMinutes: 720,
  autoSyncIntervalSeconds: 30,
};

function normalizeSettings(value: unknown): OfflineModeSettings {
  const raw = (typeof value === 'object' && value ? value : {}) as Partial<OfflineModeSettings>;
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    maxOfflineDurationMinutes: Number(raw.maxOfflineDurationMinutes) || DEFAULT_SETTINGS.maxOfflineDurationMinutes,
    autoSyncIntervalSeconds: Number(raw.autoSyncIntervalSeconds) || DEFAULT_SETTINGS.autoSyncIntervalSeconds,
  };
}

function getPosSettings(value: unknown): Record<string, unknown> {
  const row = (typeof value === 'object' && value ? value : {}) as Record<string, unknown>;
  const settings = (row.settings && typeof row.settings === 'object' ? row.settings : row) as Record<string, unknown>;
  return (settings.posSettings && typeof settings.posSettings === 'object'
    ? settings.posSettings
    : {}) as Record<string, unknown>;
}

export function OfflineModePanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [locationId, setLocationId] = useState('');
  const [settings, setSettings] = useState<OfflineModeSettings>(DEFAULT_SETTINGS);
  const [posSettings, setPosSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchLocations()
      .then((rows) => {
        setLocations(rows);
        setLocationId((current) => current || rows[0]?.id || '');
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  useEffect(() => {
    if (!locationId) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    void getLocationSettings(api, locationId)
      .then((row) => {
        const nextPosSettings = getPosSettings(row);
        setPosSettings(nextPosSettings);
        setSettings(normalizeSettings(nextPosSettings.offlineMode ?? nextPosSettings));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [api, locationId]);

  async function save() {
    if (!locationId) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await updatePosSettings(api, {
        locationId,
        settings: {
          ...posSettings,
          offlineMode: settings,
        },
      });
      setMessage('Offline mode settings saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Offline Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="offline-location">
            Location
          </label>
          <select
            id="offline-location"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => setSettings((current) => ({ ...current, enabled: event.target.checked }))}
          />
          Enable offline mode
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.allowOfflineCardPayments}
            onChange={(event) =>
              setSettings((current) => ({ ...current, allowOfflineCardPayments: event.target.checked }))
            }
          />
          Allow offline card payments
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.allowOutOfStockOfflineSales}
            onChange={(event) =>
              setSettings((current) => ({ ...current, allowOutOfStockOfflineSales: event.target.checked }))
            }
          />
          Allow out-of-stock offline sales
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.allowUnknownStockOfflineSales}
            onChange={(event) =>
              setSettings((current) => ({ ...current, allowUnknownStockOfflineSales: event.target.checked }))
            }
          />
          Allow sales when offline stock is unknown
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="offline-lockout">
              Max offline duration before lockout, minutes
            </label>
            <Input
              id="offline-lockout"
              type="number"
              min={1}
              value={settings.maxOfflineDurationMinutes}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  maxOfflineDurationMinutes: Number(event.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="offline-sync-interval">
              Auto-sync interval, seconds
            </label>
            <Input
              id="offline-sync-interval"
              type="number"
              min={5}
              value={settings.autoSyncIntervalSeconds}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  autoSyncIntervalSeconds: Number(event.target.value),
                }))
              }
            />
          </div>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button onClick={save} disabled={loading || !locationId}>
          Save offline settings
        </Button>
      </CardContent>
    </Card>
  );
}
