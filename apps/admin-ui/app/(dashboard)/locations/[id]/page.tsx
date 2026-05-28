'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
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
import { DetailPage, DetailPageHeader, DetailSectionCard, Grid, Stack } from '@/components/ui/admin-detail';
import { Checkbox, FormActions, FormErrorAlert, FormField, FormLayout, Input } from '@/components/ui/admin-form';
import { getErrorMessage } from '@/lib/utils';
import { PageLoader } from '@/components/ui/admin-loader';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function LocationEditorPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const formBaseId = useId();
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [staff, setStaff] = useState<LocationStaffMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const [loc, staffList] = await Promise.all([fetchLocation(id), fetchLocationStaff(id)]);
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
      <DetailPage>
        <DetailPageHeader
          breadcrumb={[
            { label: 'Locations', href: '/locations' },
            { label: 'Location' },
          ]}
          title="Location"
        />
        {error ? (
          <FormErrorAlert message={error} title="Unable to load location" />
        ) : (
          <PageLoader label="Loading location…" />
        )}
      </DetailPage>
    );
  }

  const delivery = location.deliverySettings as {
    radiusKm?: number;
    deliveryFee?: number;
    freeDeliveryThreshold?: number | null;
  };

  return (
    <DetailPage>
      <DetailPageHeader
        breadcrumb={[
          { label: 'Locations', href: '/locations' },
          { label: location.name },
        ]}
        title={location.name}
        description="Edit location settings, hours, fulfillment, and staff assignments."
      />
      <FormErrorAlert message={error} title="Unable to save changes" />

      <Tabs defaultValue="details">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="hours">Opening hours</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment & delivery</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <DetailSectionCard title="Location details" description="Name, address, and regional settings.">
            <FormLayout constrained={false}>
              <FormField label="Name" htmlFor={`${formBaseId}-name`}>
                <Input
                  id={`${formBaseId}-name`}
                  value={location.name}
                  onChange={(e) => setLocation({ ...location, name: e.target.value })}
                />
              </FormField>
              <FormField label="Address" htmlFor={`${formBaseId}-address`}>
                <Input
                  id={`${formBaseId}-address`}
                  value={location.address ?? ''}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                />
              </FormField>
              <Grid cols={1} gap="md" className="min-[481px]:grid-cols-2">
                <FormField label="Phone" htmlFor={`${formBaseId}-phone`}>
                  <Input
                    id={`${formBaseId}-phone`}
                    value={location.phone}
                    onChange={(e) => setLocation({ ...location, phone: e.target.value })}
                  />
                </FormField>
                <FormField label="Timezone" htmlFor={`${formBaseId}-timezone`}>
                  <Input
                    id={`${formBaseId}-timezone`}
                    value={location.timezone}
                    onChange={(e) => setLocation({ ...location, timezone: e.target.value })}
                  />
                </FormField>
              </Grid>
              <FormField label="Currency" htmlFor={`${formBaseId}-currency`}>
                <Input
                  id={`${formBaseId}-currency`}
                  value={location.currency}
                  onChange={(e) => setLocation({ ...location, currency: e.target.value })}
                />
              </FormField>
              <FormActions>
                <Button type="button" isLoading={loading} loadingLabel="Saving…" onClick={() => void saveDetails()}>
                  Save details
                </Button>
              </FormActions>
            </FormLayout>
          </DetailSectionCard>
        </TabsContent>

        <TabsContent value="hours" className="mt-4">
          <DetailSectionCard title="Opening hours" description="Set open/close times or mark days closed.">
            <Stack gap="md">
              {location.openingHours.map((row, index) => (
                <Grid
                  key={row.dayOfWeek}
                  cols={1}
                  gap="sm"
                  className="items-center min-[481px]:grid-cols-[4rem_1fr_1fr_auto]"
                >
                  <span className="text-sm font-medium text-foreground">
                    {DAY_LABELS[row.dayOfWeek] ?? row.dayOfWeek}
                  </span>
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
                  <Checkbox
                    label="Closed"
                    checked={row.isClosed}
                    onChange={(e) => {
                      const hours = [...location.openingHours];
                      hours[index] = { ...row, isClosed: e.target.checked };
                      setLocation({ ...location, openingHours: hours });
                    }}
                  />
                </Grid>
              ))}
              <FormActions>
                <Button type="button" isLoading={loading} loadingLabel="Saving…" onClick={() => void saveHours()}>
                  Save hours
                </Button>
              </FormActions>
            </Stack>
          </DetailSectionCard>
        </TabsContent>

        <TabsContent value="fulfillment" className="mt-4">
          <DetailSectionCard title="Delivery settings" description="Radius, fees, and fulfillment options.">
            <FormLayout constrained={false}>
              <FormField label="Radius (km)" htmlFor={`${formBaseId}-radius`}>
                <Input
                  id={`${formBaseId}-radius`}
                  type="number"
                  value={delivery.radiusKm ?? 5}
                  onChange={(e) =>
                    setLocation({
                      ...location,
                      deliverySettings: { ...delivery, radiusKm: Number(e.target.value) },
                    })
                  }
                />
              </FormField>
              <FormField label="Delivery fee" htmlFor={`${formBaseId}-fee`}>
                <Input
                  id={`${formBaseId}-fee`}
                  type="number"
                  value={delivery.deliveryFee ?? 0}
                  onChange={(e) =>
                    setLocation({
                      ...location,
                      deliverySettings: { ...delivery, deliveryFee: Number(e.target.value) },
                    })
                  }
                />
              </FormField>
              <FormActions>
                <Button type="button" isLoading={loading} loadingLabel="Saving…" onClick={() => void saveFulfillment()}>
                  Save fulfillment & delivery
                </Button>
              </FormActions>
            </FormLayout>
          </DetailSectionCard>
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <DetailSectionCard title="Staff assignments" description="Toggle which staff members are assigned to this location.">
            <Stack gap="sm">
              {staff.map((member) => (
                <label
                  key={member.userId}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm"
                >
                  <span className="font-medium text-foreground">
                    {member.name} · {member.roleName ?? 'staff'}
                  </span>
                  <Checkbox
                    checked={member.assigned}
                    onChange={() => void toggleStaff(member.userId, member.assigned)}
                  />
                </label>
              ))}
            </Stack>
          </DetailSectionCard>
        </TabsContent>
      </Tabs>
    </DetailPage>
  );
}
