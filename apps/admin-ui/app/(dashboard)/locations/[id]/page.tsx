'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared-ui';
import {
  assignLocationStaff,
  fetchLocation,
  fetchLocationStaff,
  updateLocation,
  updateLocationHours,
  updateLocationSettings,
  type LocationDetail,
  type LocationStaffMember,
} from '@/lib/api/locations';
import { getErrorMessage } from '@/lib/utils';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function LocationEditorPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [staff, setStaff] = useState<LocationStaffMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const [loc, staffList] = await Promise.all([
        fetchLocation(id),
        fetchLocationStaff(id),
      ]);
      setLocation(loc);
      setStaff(staffList);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveDetails() {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      await updateLocation(id, {
        name: location.name,
        address: location.address ?? undefined,
        phone: location.phone,
        timezone: location.timezone,
        currency: location.currency,
        status: location.status,
      });
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveFulfillment() {
    if (!location) return;
    setLoading(true);
    try {
      await updateLocationSettings(id, {
        fulfillment: location.fulfillmentSettings,
        deliverySettings: location.deliverySettings,
      });
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveHours() {
    if (!location) return;
    setLoading(true);
    try {
      await updateLocationHours(id, location.openingHours);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function toggleStaff(userId: string, assigned: boolean) {
    const next = assigned
      ? staff.filter((s) => s.userId !== userId).map((s) => s.userId)
      : [...staff.filter((s) => s.assigned).map((s) => s.userId), userId];
    await assignLocationStaff(id, next);
    await load();
  }

  if (!location) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {error ?? 'Loading location…'}
      </div>
    );
  }

  const delivery = location.deliverySettings as {
    radiusKm?: number;
    deliveryFee?: number;
    freeDeliveryThreshold?: number | null;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{location.name}</h1>
          <p className="text-sm text-muted-foreground">Edit location settings and staff.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/locations">Back to list</Link>
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="hours">Opening hours</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment & delivery</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Input
                value={location.name}
                onChange={(e) => setLocation({ ...location, name: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={location.address ?? ''}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={location.phone}
                onChange={(e) => setLocation({ ...location, phone: e.target.value })}
              />
              <Input
                placeholder="Timezone"
                value={location.timezone}
                onChange={(e) => setLocation({ ...location, timezone: e.target.value })}
              />
              <Input
                placeholder="Currency"
                value={location.currency}
                onChange={(e) => setLocation({ ...location, currency: e.target.value })}
              />
              <Button disabled={loading} onClick={() => void saveDetails()}>
                Save details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="mt-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
              {location.openingHours.map((row, index) => (
                <div key={row.dayOfWeek} className="grid grid-cols-4 items-center gap-2 text-sm">
                  <span>{DAY_LABELS[row.dayOfWeek] ?? row.dayOfWeek}</span>
                  <Input
                    placeholder="Open"
                    value={row.openTime ?? ''}
                    onChange={(e) => {
                      const hours = [...location.openingHours];
                      hours[index] = { ...row, openTime: e.target.value || null };
                      setLocation({ ...location, openingHours: hours });
                    }}
                  />
                  <Input
                    placeholder="Close"
                    value={row.closeTime ?? ''}
                    onChange={(e) => {
                      const hours = [...location.openingHours];
                      hours[index] = { ...row, closeTime: e.target.value || null };
                      setLocation({ ...location, openingHours: hours });
                    }}
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.isClosed}
                      onChange={(e) => {
                        const hours = [...location.openingHours];
                        hours[index] = { ...row, isClosed: e.target.checked };
                        setLocation({ ...location, openingHours: hours });
                      }}
                    />
                    Closed
                  </label>
                </div>
              ))}
              <Button disabled={loading} onClick={() => void saveHours()}>
                Save hours
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fulfillment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="number"
                placeholder="Radius (km)"
                value={delivery.radiusKm ?? 5}
                onChange={(e) =>
                  setLocation({
                    ...location,
                    deliverySettings: {
                      ...delivery,
                      radiusKm: Number(e.target.value),
                    },
                  })
                }
              />
              <Input
                type="number"
                placeholder="Delivery fee"
                value={delivery.deliveryFee ?? 0}
                onChange={(e) =>
                  setLocation({
                    ...location,
                    deliverySettings: {
                      ...delivery,
                      deliveryFee: Number(e.target.value),
                    },
                  })
                }
              />
              <Button disabled={loading} onClick={() => void saveFulfillment()}>
                Save fulfillment & delivery
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <Card>
            <CardContent className="space-y-2 pt-6">
              {staff.map((member) => (
                <label
                  key={member.userId}
                  className="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    {member.name} · {member.roleName ?? 'staff'}
                  </span>
                  <input
                    type="checkbox"
                    checked={member.assigned}
                    onChange={() => void toggleStaff(member.userId, member.assigned)}
                  />
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
