'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@shared-ui';

const ENTITY_TYPES = [
  'order',
  'inventory',
  'product',
  'category',
  'user',
  'role',
  'customer',
  'location',
  'payment',
  'gift_card',
  'store_credit',
  'billing',
  'support',
  'subscription',
  'promotion',
  'delivery',
  'marketing',
  'auth',
  'webhook',
];

export function AuditLogsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const key of ['from', 'to', 'userId', 'locationId', 'entityType', 'action', 'actorType', 'source', 'status', 'riskLevel']) {
      const value = String(formData.get(key) ?? '').trim();
      if (value) params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <form className="mb-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6" onSubmit={onSubmit}>
      <Input name="from" type="date" defaultValue={searchParams.get('from') ?? ''} />
      <Input name="to" type="date" defaultValue={searchParams.get('to') ?? ''} />
      <Input name="userId" placeholder="Staff or customer ID" defaultValue={searchParams.get('userId') ?? ''} />
      <Input name="locationId" placeholder="Location ID" defaultValue={searchParams.get('locationId') ?? ''} />
      <select
        name="entityType"
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        defaultValue={searchParams.get('entityType') ?? ''}
      >
        <option value="">All entity types</option>
        {ENTITY_TYPES.map((entityType) => (
          <option key={entityType} value={entityType}>
            {entityType.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Input name="action" placeholder="Action" defaultValue={searchParams.get('action') ?? ''} />
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </div>
      <select name="actorType" className="h-10 rounded-md border border-input bg-background px-3 text-sm" defaultValue={searchParams.get('actorType') ?? ''}>
        <option value="">All actors</option>
        <option value="staff">Staff</option>
        <option value="customer">Customer</option>
        <option value="system">System</option>
      </select>
      <select name="status" className="h-10 rounded-md border border-input bg-background px-3 text-sm" defaultValue={searchParams.get('status') ?? ''}>
        <option value="">All outcomes</option>
        <option value="success">Success</option>
        <option value="failed">Failed</option>
      </select>
      <select name="riskLevel" className="h-10 rounded-md border border-input bg-background px-3 text-sm" defaultValue={searchParams.get('riskLevel') ?? ''}>
        <option value="">All risk levels</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <Input name="source" placeholder="Source" defaultValue={searchParams.get('source') ?? ''} />
    </form>
  );
}
