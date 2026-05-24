'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@shared-ui';

const STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled',
  'refunded',
  'failed',
];

const CHANNELS = ['online', 'pos', 'delivery', 'pickup', 'dine_in'];

export function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const status = String(formData.get('status') ?? '');
    const channel = String(formData.get('channel') ?? '');
    const from = String(formData.get('from') ?? '');
    const to = String(formData.get('to') ?? '');
    if (status) params.set('status', status);
    if (channel) params.set('channel', channel);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    router.push(`?${params.toString()}`);
  }

  return (
    <form className="mb-4 flex flex-wrap gap-2" onSubmit={onSubmit}>
      <select
        name="status"
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        defaultValue={searchParams.get('status') ?? ''}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        name="channel"
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        defaultValue={searchParams.get('channel') ?? ''}
      >
        <option value="">All channels</option>
        {CHANNELS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <Input name="from" type="date" defaultValue={searchParams.get('from') ?? ''} />
      <Input name="to" type="date" defaultValue={searchParams.get('to') ?? ''} />
      <Button type="submit" variant="secondary">
        Filter
      </Button>
    </form>
  );
}
