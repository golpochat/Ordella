'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { updateFulfillmentSettings } from '@/lib/api/admin/settings';
import { getErrorMessage } from '@/lib/utils';

export function FulfillmentDisplayPanel() {
  const api = createBrowserApiClient();
  const [locationId, setLocationId] = useState('');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [showCustomerInfo, setShowCustomerInfo] = useState(true);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [autoCompleteMinutes, setAutoCompleteMinutes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!locationId.trim()) {
      setError('Location ID is required');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await updateFulfillmentSettings(api, {
        locationId: locationId.trim(),
        autoAcceptOrders,
        soundAlerts,
        showCustomerInfo,
        displayMode,
        autoCompleteMinutes: autoCompleteMinutes ? Number(autoCompleteMinutes) : null,
      });
      setMessage('Fulfillment display settings saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fulfillment display (FDS)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Location ID (UUID)"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoAcceptOrders}
            onChange={(e) => setAutoAcceptOrders(e.target.checked)}
          />
          Auto-accept orders (start in progress when acknowledged)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={soundAlerts}
            onChange={(e) => setSoundAlerts(e.target.checked)}
          />
          Sound alerts on FDS (location default)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showCustomerInfo}
            onChange={(e) => setShowCustomerInfo(e.target.checked)}
          />
          Show customer info on order cards
        </label>
        <div className="space-y-1">
          <p className="text-sm font-medium">Display mode</p>
          <select
            className="h-10 w-full rounded-md border bg-background px-2 text-sm"
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value as 'grid' | 'list')}
          >
            <option value="grid">Grid (columns)</option>
            <option value="list">List</option>
          </select>
        </div>
        <Input
          type="number"
          min={1}
          placeholder="Auto-complete after minutes (optional)"
          value={autoCompleteMinutes}
          onChange={(e) => setAutoCompleteMinutes(e.target.value)}
        />
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button onClick={onSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save fulfillment settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
