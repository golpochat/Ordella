'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@shared-ui';

export function InventoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const search = String(formData.get('search') ?? '');
    const from = String(formData.get('from') ?? '');
    const to = String(formData.get('to') ?? '');
    if (search) params.set('search', search);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    router.push(`?${params.toString()}`);
  }

  return (
    <form className="mb-4 flex flex-wrap gap-2" onSubmit={onSubmit}>
      <Input
        name="search"
        placeholder="Search SKU or name"
        defaultValue={searchParams.get('search') ?? ''}
        className="max-w-xs"
      />
      <Input name="from" type="date" defaultValue={searchParams.get('from') ?? ''} />
      <Input name="to" type="date" defaultValue={searchParams.get('to') ?? ''} />
      <Button type="submit" variant="secondary">
        Apply
      </Button>
    </form>
  );
}
