'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { DEFAULT_TENANT_SETTINGS, normalizeTenantSettings, type TenantSettings } from '@shared-utils';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  getTenantLocalizationSettings,
  updateTenantLocalizationSettings,
} from '@/lib/api/admin/settings';
import { getErrorMessage } from '@/lib/utils';

export function TenantLocalizationPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [settings, setSettings] = useState<TenantSettings>(DEFAULT_TENANT_SETTINGS);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getTenantLocalizationSettings(api)
      .then((data) => {
        if (!cancelled) setSettings(normalizeTenantSettings(data));
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api]);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const saved = await updateTenantLocalizationSettings(api, {
        ...settings,
        defaultTaxRate: Number(settings.defaultTaxRate),
      });
      setSettings(normalizeTenantSettings((saved as { data?: unknown }).data ?? settings));
      setMessage('Tenant localization settings saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Settings & Localization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Currency code"
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value.toUpperCase() })}
          />
          <Input
            placeholder="Currency symbol"
            value={settings.currencySymbol}
            onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
          />
          <Input
            placeholder="Locale"
            value={settings.locale}
            onChange={(e) => setSettings({ ...settings, locale: e.target.value })}
          />
          <Input
            placeholder="Timezone"
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
          />
          <Input
            placeholder="Date format"
            value={settings.dateFormat}
            onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
          />
          <Input
            placeholder="Number format"
            value={settings.numberFormat}
            onChange={(e) => setSettings({ ...settings, numberFormat: e.target.value })}
          />
          <Input
            placeholder="Country code"
            value={settings.country}
            onChange={(e) => setSettings({ ...settings, country: e.target.value.toUpperCase() })}
          />
          <Input
            type="number"
            min={0}
            step="0.0001"
            placeholder="Default tax rate"
            value={settings.defaultTaxRate}
            onChange={(e) => setSettings({ ...settings, defaultTaxRate: e.target.value })}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Defaults: EUR, €, en-IE, Europe/Dublin, DD/MM/YYYY.
        </p>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="button" disabled={loading || saving} onClick={save}>
          {saving ? 'Saving…' : 'Save tenant settings'}
        </Button>
      </CardContent>
    </Card>
  );
}

