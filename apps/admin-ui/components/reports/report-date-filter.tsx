'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button, Input } from '@shared-ui';

export function ReportDateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    const from = String(formData.get('from') ?? '');
    const to = String(formData.get('to') ?? '');
    if (from) params.set('from', from);
    else params.delete('from');
    if (to) params.set('to', to);
    else params.delete('to');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form className="mb-4 flex flex-wrap gap-2" onSubmit={onSubmit}>
      <Input name="from" type="date" defaultValue={searchParams.get('from') ?? ''} />
      <Input name="to" type="date" defaultValue={searchParams.get('to') ?? ''} />
      <Button type="submit" variant="secondary">
        Apply range
      </Button>
    </form>
  );
}
