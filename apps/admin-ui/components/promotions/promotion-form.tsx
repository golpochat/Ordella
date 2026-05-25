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
  const [description, setDescription] = useState(promotion?.description ?? '');
  const [type, setType] = useState<Promotion['type']>(promotion?.type ?? 'percentage');
  const [value, setValue] = useState(promotion?.value ?? '');
  const [code, setCode] = useState(promotion?.code ?? '');
  const [buyQuantity, setBuyQuantity] = useState(promotion?.buyQuantity ? String(promotion.buyQuantity) : '');
  const [getQuantity, setGetQuantity] = useState(promotion?.getQuantity ? String(promotion.getQuantity) : '');
  const [minSpend, setMinSpend] = useState(promotion?.minSpend ?? '');
  const [channel, setChannel] = useState<'pos' | 'online' | 'both'>(promotion?.channel ?? 'both');
  const [autoApply, setAutoApply] = useState(promotion?.autoApply ?? true);
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
      description: description || undefined,
      type,
      value,
      code: code || undefined,
      buyQuantity: buyQuantity ? Number(buyQuantity) : undefined,
      getQuantity: getQuantity ? Number(getQuantity) : undefined,
      minSpend: minSpend || undefined,
      channel,
      autoApply,
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
          <option value="percentage">Percentage discount</option>
          <option value="fixed">Fixed discount</option>
          <option value="threshold">Spend threshold</option>
          <option value="category">Category discount</option>
          <option value="bxgy">Buy X get Y</option>
          <option value="time-based">Time-based</option>
          <option value="coupon">Coupon</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="promo-description">
          Description
        </label>
        <Input id="promo-description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="promo-value">
          Value
        </label>
        <Input id="promo-value" required value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="min-spend">
            Minimum spend
          </label>
          <Input id="min-spend" value={minSpend} onChange={(e) => setMinSpend(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="buy-qty">
            Buy quantity
          </label>
          <Input id="buy-qty" type="number" min={1} value={buyQuantity} onChange={(e) => setBuyQuantity(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="get-qty">
            Get quantity
          </label>
          <Input id="get-qty" type="number" min={1} value={getQuantity} onChange={(e) => setGetQuantity(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="promo-code">
          Code
        </label>
        <Input id="promo-code" value={code} onChange={(e) => setCode(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="channel">
            Channel
          </label>
          <select
            id="channel"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={channel}
            onChange={(e) => setChannel(e.target.value as typeof channel)}
          >
            <option value="both">POS and online</option>
            <option value="pos">POS only</option>
            <option value="online">Online only</option>
          </select>
        </div>
        <label className="flex items-center gap-2 pt-7 text-sm">
          <input type="checkbox" checked={autoApply} onChange={(e) => setAutoApply(e.target.checked)} />
          Auto-apply eligible promotion
        </label>
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
