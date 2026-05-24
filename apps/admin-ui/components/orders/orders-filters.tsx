'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { labelOrderChannel, labelOrderStatus, ORDER_CHANNEL_LABELS, ORDER_STATUS_LABELS } from '@shared-utils';
import { Button, Input } from '@shared-ui';

const STATUS_VALUES = Object.keys(ORDER_STATUS_LABELS);
const CHANNEL_VALUES = Object.keys(ORDER_CHANNEL_LABELS);

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
        {STATUS_VALUES.map((s) => (
          <option key={s} value={s}>
            {labelOrderStatus(s)}
          </option>
        ))}
      </select>
      <select
        name="channel"
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        defaultValue={searchParams.get('channel') ?? ''}
      >
        <option value="">All channels</option>
        {CHANNEL_VALUES.map((c) => (
          <option key={c} value={c}>
            {labelOrderChannel(c)}
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
