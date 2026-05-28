'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { updateFulfillmentSettings } from '@/lib/api/admin/settings';
import { getErrorMessage } from '@/lib/utils';

export function FulfillmentDisplayPanel() {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = createBrowserApiClient();
  const [locationId, setLocationId] = useState('');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [showCustomerInfo, setShowCustomerInfo] = useState(true);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [autoCompleteMinutes, setAutoCompleteMinutes] = useState('');
    const [loading, setLoading] = useState(false);

  const onSave = async () => {

    if (!locationId.trim()) {
      toastError('Location ID is required');
      return;
    }
    setLoading(true);
    try {
      await updateFulfillmentSettings(api, {
        locationId: locationId.trim(),
        autoAcceptOrders,
        soundAlerts,
        showCustomerInfo,
        displayMode,
        autoCompleteMinutes: autoCompleteMinutes ? Number(autoCompleteMinutes) : null,
      });
      toastSuccess('Fulfillment display settings saved');
    } catch (err) {
      toastError(getErrorMessage(err));
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
          <Select
            className="h-10 w-full rounded-md border bg-background px-2 text-sm"
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value as 'grid' | 'list')}
          >
            <option value="grid">Grid (columns)</option>
            <option value="list">List</option>
          </Select>
        </div>
        <Input
          type="number"
          min={1}
          placeholder="Auto-complete after minutes (optional)"
          value={autoCompleteMinutes}
          onChange={(e) => setAutoCompleteMinutes(e.target.value)}
        />
        <Button onClick={onSave} isLoading={loading} loadingLabel="Saving…">
          Save fulfillment settings
        </Button>
      </CardContent>
    </Card>
  );
}
