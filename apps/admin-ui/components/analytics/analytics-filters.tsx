'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@shared-ui';
import { defaultAnalyticsRange } from '@/lib/api/admin/analytics';

type AnalyticsFiltersProps = {
  locations: { id: string; name: string }[];
};

export function AnalyticsFilters({ locations }: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaults = defaultAnalyticsRange();

  const from = searchParams.get('from') ?? defaults.from;
  const to = searchParams.get('to') ?? defaults.to;
  const locationId = searchParams.get('locationId') ?? '';

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const nextFrom = String(form.get('from') || defaults.from);
    const nextTo = String(form.get('to') || defaults.to);
    const nextLocation = String(form.get('locationId') || '');

    params.set('from', nextFrom);
    params.set('to', nextTo);
    if (nextLocation) {
      params.set('locationId', nextLocation);
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
      onSubmit={onSubmit}
    >
      <div className="space-y-1">
        <label htmlFor="analytics-from" className="text-sm font-medium">
          From
        </label>
        <Input id="analytics-from" name="from" type="date" defaultValue={from} />
      </div>
      <div className="space-y-1">
        <label htmlFor="analytics-to" className="text-sm font-medium">
          To
        </label>
        <Input id="analytics-to" name="to" type="date" defaultValue={to} />
      </div>
      {locations.length > 1 ? (
        <div className="space-y-1">
          <label htmlFor="analytics-location" className="text-sm font-medium">
            Location
          </label>
          <select
            id="analytics-location"
            name="locationId"
            defaultValue={locationId}
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <Button type="submit">Apply</Button>
    </form>
  );
}
