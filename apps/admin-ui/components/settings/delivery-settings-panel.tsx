'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createDeliveryAssignment, getDeliverySettings, updateDeliverySettings } from '@/lib/api/admin/settings';
import { fetchLocations, updateLocation, type LocationListItem } from '@/lib/api/locations';
import { getErrorMessage } from '@/lib/utils';

export function DeliverySettingsPanel() {
  const api = createBrowserApiClient();
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [locationId, setLocationId] = useState('');
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('5');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('0');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [zoneName, setZoneName] = useState('Primary delivery zone');
  const [centerLat, setCenterLat] = useState('');
  const [centerLng, setCenterLng] = useState('');
  const [zonesJson, setZonesJson] = useState('[]');
  const [overrideTaskId, setOverrideTaskId] = useState('');
  const [overrideDriverId, setOverrideDriverId] = useState('');
  const [autoAssignDrivers, setAutoAssignDrivers] = useState(false);
  const [maxActiveDeliveriesPerDriver, setMaxActiveDeliveriesPerDriver] = useState('3');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void Promise.all([fetchLocations(), getDeliverySettings(api)])
      .then(([locationRows, settings]) => {
        setLocations(locationRows);
        const record = settings as Record<string, unknown>;
        if (typeof record.deliveryEnabled === 'boolean') setDeliveryEnabled(record.deliveryEnabled);
        if (record.deliveryRadiusKm !== undefined) setDeliveryRadiusKm(String(record.deliveryRadiusKm));
        if (record.deliveryFee !== undefined) setDeliveryFee(String(record.deliveryFee));
        if (record.minimumOrderAmount !== undefined) setMinimumOrderAmount(String(record.minimumOrderAmount));
        if (record.freeDeliveryThreshold !== null && record.freeDeliveryThreshold !== undefined) {
          setFreeDeliveryThreshold(String(record.freeDeliveryThreshold));
        }
        if (Array.isArray(record.deliveryZones)) {
          setZonesJson(JSON.stringify(record.deliveryZones, null, 2));
        }
        if (locationRows[0]) setLocationId(locationRows[0].id);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === locationId),
    [locations, locationId],
  );

  async function save() {
    let deliveryZones: Record<string, unknown>[];
    try {
      const parsed = JSON.parse(zonesJson) as unknown;
      deliveryZones = Array.isArray(parsed) ? parsed as Record<string, unknown>[] : [];
    } catch {
      setError('Delivery zones must be valid JSON');
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await updateDeliverySettings(api, {
        locationId: locationId || undefined,
        deliveryEnabled,
        deliveryRadiusKm: Number(deliveryRadiusKm),
        deliveryFee: Number(deliveryFee),
        minimumOrderAmount: Number(minimumOrderAmount),
        freeDeliveryThreshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : null,
        deliveryZones,
        autoAssignDrivers,
        maxActiveDeliveriesPerDriver: Number(maxActiveDeliveriesPerDriver),
      });
      if (locationId) {
        await updateLocation(locationId, { deliveryZones });
      }
      setMessage('Saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function addRadiusZone() {
    let current: Record<string, unknown>[];
    try {
      const parsed = JSON.parse(zonesJson) as unknown;
      current = Array.isArray(parsed) ? parsed as Record<string, unknown>[] : [];
    } catch {
      setError('Delivery zones must be valid JSON before adding a radius zone');
      return;
    }
    const lat = Number(centerLat);
    const lng = Number(centerLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Center latitude and longitude are required for a radius zone');
      return;
    }
    const next = [
      ...current,
      {
        type: 'radius',
        name: zoneName,
        radiusKm: Number(deliveryRadiusKm),
        center: { lat, lng },
      },
    ];
    setZonesJson(JSON.stringify(next, null, 2));
    setError(null);
  }

  async function assignDriver() {
    if (!overrideTaskId || !overrideDriverId) {
      setError('Delivery task ID and driver ID are required');
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await createDeliveryAssignment(api, {
        deliveryTaskId: overrideTaskId,
        driverProfileId: overrideDriverId,
        assignmentType: 'manual',
      });
      setMessage('Driver assigned');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[var(--radius)]">
      <CardHeader>
        <CardTitle className="text-lg">Delivery zones and routing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={deliveryEnabled}
            onChange={(e) => setDeliveryEnabled(e.target.checked)}
          />
          Enable delivery for this tenant
        </label>
        <div className="space-y-2">
          <label htmlFor="delivery-location" className="text-sm font-medium">
            Location for zone management
          </label>
          <select
            id="delivery-location"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">Tenant default zones only</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          {selectedLocation ? (
            <p className="text-xs text-muted-foreground">
              Zones saved here also update {selectedLocation.name} for location-aware routing.
            </p>
          ) : null}
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
          <label htmlFor="minimum-order" className="text-sm font-medium">
            Minimum order amount
          </label>
          <Input
            id="minimum-order"
            type="number"
            min={0}
            step="0.01"
            value={minimumOrderAmount}
            onChange={(e) => setMinimumOrderAmount(e.target.value)}
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
        <div className="rounded-md border bg-muted/40 p-4">
          <p className="text-sm font-medium">Radius selector</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a radius zone now, or paste polygon JSON below using points with lat/lng pairs.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Input
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Zone name"
            />
            <Input
              type="number"
              value={centerLat}
              onChange={(e) => setCenterLat(e.target.value)}
              placeholder="Center lat"
            />
            <Input
              type="number"
              value={centerLng}
              onChange={(e) => setCenterLng(e.target.value)}
              placeholder="Center lng"
            />
          </div>
          <Button type="button" variant="outline" className="mt-3" onClick={addRadiusZone}>
            Add radius zone
          </Button>
        </div>
        <div className="space-y-2">
          <label htmlFor="delivery-zones-json" className="text-sm font-medium">
            Delivery zones JSON
          </label>
          <textarea
            id="delivery-zones-json"
            className="min-h-40 w-full rounded-md border bg-background p-3 font-mono text-sm"
            value={zonesJson}
            onChange={(e) => setZonesJson(e.target.value)}
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
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium">Manual driver override</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input
              value={overrideTaskId}
              onChange={(e) => setOverrideTaskId(e.target.value)}
              placeholder="Delivery task UUID"
            />
            <Input
              value={overrideDriverId}
              onChange={(e) => setOverrideDriverId(e.target.value)}
              placeholder="Driver profile UUID"
            />
          </div>
          <Button type="button" variant="outline" className="mt-3" onClick={assignDriver} disabled={loading}>
            Assign driver
          </Button>
        </div>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button onClick={save} disabled={loading}>
          Save delivery settings
        </Button>
      </CardContent>
    </Card>
  );
}
