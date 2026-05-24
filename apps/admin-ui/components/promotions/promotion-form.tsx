'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Promotion } from '@shared-utils';
import { Button, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createPromotion, updatePromotion } from '@/lib/api/admin/promotions';
import { getErrorMessage } from '@/lib/utils';

type PromotionFormProps = {
  promotion?: Promotion;
};

export function PromotionForm({ promotion }: PromotionFormProps) {
  const router = useRouter();
  const [name, setName] = useState(promotion?.name ?? '');
  const [type, setType] = useState<'automatic' | 'coupon'>(promotion?.type ?? 'automatic');
  const [value, setValue] = useState(promotion?.value ?? '');
  const [code, setCode] = useState(promotion?.code ?? '');
  const [startDate, setStartDate] = useState(
    promotion?.startDate ? new Date(promotion.startDate).toISOString().slice(0, 10) : '',
  );
  const [endDate, setEndDate] = useState(
    promotion?.endDate ? new Date(promotion.endDate).toISOString().slice(0, 10) : '',
  );
  const [usageLimit, setUsageLimit] = useState(
    promotion?.usageLimit != null ? String(promotion.usageLimit) : '',
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = {
      name,
      type,
      value,
      code: code || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
    };

    try {
      const api = createBrowserApiClient();
      if (promotion) {
        await updatePromotion(api, promotion.id, body);
      } else {
        await createPromotion(api, body);
      }
      router.push('/promotions');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form className="max-w-lg space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="promo-name">
          Name
        </label>
        <Input id="promo-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="promo-type">
          Type
        </label>
        <select
          id="promo-type"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
        >
          <option value="automatic">Automatic</option>
          <option value="coupon">Coupon</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="promo-value">
          Value
        </label>
        <Input id="promo-value" required value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="promo-code">
          Code
        </label>
        <Input id="promo-code" value={code} onChange={(e) => setCode(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="start">
            Start date
          </label>
          <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="end">
            End date
          </label>
          <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="limit">
          Usage limit
        </label>
        <Input
          id="limit"
          type="number"
          min={1}
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit">{promotion ? 'Save promotion' : 'Create promotion'}</Button>
    </form>
  );
}
