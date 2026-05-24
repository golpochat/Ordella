'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { updateDeliverySettings } from '@/lib/api/admin/settings';
import { getErrorMessage } from '@/lib/utils';

export function DeliverySettingsPanel() {
  const api = createBrowserApiClient();
  const [locationId, setLocationId] = useState('');
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('5');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [autoAssignDrivers, setAutoAssignDrivers] = useState(false);
  const [maxActiveDeliveriesPerDriver, setMaxActiveDeliveriesPerDriver] = useState('3');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!locationId.trim()) {
      setError('Location ID is required');
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await updateDeliverySettings(api, {
        locationId: locationId.trim(),
        deliveryRadiusKm: Number(deliveryRadiusKm),
        deliveryFee: Number(deliveryFee),
        freeDeliveryThreshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : null,
        autoAssignDrivers,
        maxActiveDeliveriesPerDriver: Number(maxActiveDeliveriesPerDriver),
      });
      setMessage('Saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Delivery settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="delivery-location" className="text-sm font-medium">
            Location ID
          </label>
          <Input
            id="delivery-location"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            placeholder="Location UUID"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="delivery-radius" className="text-sm font-medium">
            Delivery radius (km)
          </label>
          <Input
            id="delivery-radius"
            type="number"
            min={0}
            value={deliveryRadiusKm}
            onChange={(e) => setDeliveryRadiusKm(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="delivery-fee" className="text-sm font-medium">
            Delivery fee
          </label>
          <Input
            id="delivery-fee"
            type="number"
            min={0}
            step="0.01"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="free-threshold" className="text-sm font-medium">
            Free delivery threshold (optional)
          </label>
          <Input
            id="free-threshold"
            type="number"
            min={0}
            step="0.01"
            value={freeDeliveryThreshold}
            onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="max-active" className="text-sm font-medium">
            Max active deliveries per driver
          </label>
          <Input
            id="max-active"
            type="number"
            min={1}
            value={maxActiveDeliveriesPerDriver}
            onChange={(e) => setMaxActiveDeliveriesPerDriver(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoAssignDrivers}
            onChange={(e) => setAutoAssignDrivers(e.target.checked)}
          />
          Auto-assign drivers
        </label>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button onClick={save} disabled={loading || !locationId}>
          Save delivery settings
        </Button>
      </CardContent>
    </Card>
  );
}
