'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Promotion } from '@shared-utils';
import { Button, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createPromotion, previewPromotion, updatePromotion, type PromotionPreview } from '@/lib/api/admin/promotions';
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
  const [priority, setPriority] = useState(promotion?.priority != null ? String(promotion.priority) : '100');
  const [stackable, setStackable] = useState(promotion?.stackable ?? false);
  const [conflictStrategy, setConflictStrategy] = useState<'best_price' | 'priority' | 'exclusive'>(
    promotion?.conflictStrategy ?? 'best_price',
  );
  const [applicableItems, setApplicableItems] = useState((promotion?.applicableItems ?? []).join(', '));
  const [applicableCategories, setApplicableCategories] = useState((promotion?.applicableCategories ?? []).join(', '));
  const [applicableLocations, setApplicableLocations] = useState((promotion?.applicableLocations ?? []).join(', '));
  const [eligibleCustomerSegments, setEligibleCustomerSegments] = useState(
    (promotion?.eligibleCustomerSegments ?? []).join(', '),
  );
  const [requiredQuantity, setRequiredQuantity] = useState(
    typeof promotion?.metadata?.requiredQuantity === 'number' ? String(promotion.metadata.requiredQuantity) : '',
  );
  const [discountMode, setDiscountMode] = useState<'fixed' | 'percentage'>(
    promotion?.metadata?.discountMode === 'percentage' ? 'percentage' : 'fixed',
  );
  const [inventoryRule, setInventoryRule] = useState(false);
  const [demandRule, setDemandRule] = useState(false);
  const [happyHourStart, setHappyHourStart] = useState('');
  const [happyHourEnd, setHappyHourEnd] = useState('');
  const [previewSubtotal, setPreviewSubtotal] = useState('100.00');
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
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
      priority: priority ? Number(priority) : undefined,
      stackable,
      conflictStrategy,
      applicableItems: csv(applicableItems),
      applicableCategories: csv(applicableCategories),
      applicableLocations: csv(applicableLocations),
      eligibleCustomerSegments: csv(eligibleCustomerSegments),
      dynamicPricingRules: buildDynamicPricingRules(),
      metadata: {
        requiredQuantity: requiredQuantity ? Number(requiredQuantity) : undefined,
        discountMode,
      },
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

  async function onPreview() {
    setError(null);
    setPreview(null);
    try {
      const api = createBrowserApiClient();
      const result = await previewPromotion(api, {
        promotion: {
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
          priority: priority ? Number(priority) : undefined,
          stackable,
          conflictStrategy,
          applicableItems: csv(applicableItems),
          applicableCategories: csv(applicableCategories),
          applicableLocations: csv(applicableLocations),
          eligibleCustomerSegments: csv(eligibleCustomerSegments),
          dynamicPricingRules: buildDynamicPricingRules(),
          metadata: {
            requiredQuantity: requiredQuantity ? Number(requiredQuantity) : undefined,
            discountMode,
          },
        },
        subtotal: previewSubtotal || '0.00',
        channel,
        customerSegmentIds: csv(eligibleCustomerSegments),
      });
      setPreview(result);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function buildDynamicPricingRules() {
    return {
      inventoryBased: inventoryRule
        ? { enabled: true, lowStockThreshold: 5, reductionPercent: 50 }
        : { enabled: false },
      demandBased: demandRule
        ? { enabled: true, demandScore: 75, multiplier: 0.7 }
        : { enabled: false },
      timeOfDay:
        happyHourStart && happyHourEnd
          ? { enabled: true, windows: [{ start: happyHourStart, end: happyHourEnd, multiplier: 1.25 }] }
          : { enabled: false },
    };
  }

  return (
    <form className="max-w-4xl space-y-6" onSubmit={onSubmit}>
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
          <option value="mix-and-match">Mix & match bundle</option>
          <option value="combo">Combo meal / product kit</option>
          <option value="time-based">Time-based</option>
          <option value="location">Location-specific</option>
          <option value="customer-segment">Customer segment</option>
          <option value="dynamic-pricing">Dynamic pricing</option>
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
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="priority">
            Priority
          </label>
          <Input id="priority" type="number" min={1} value={priority} onChange={(e) => setPriority(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="conflict">
            Conflict strategy
          </label>
          <select
            id="conflict"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={conflictStrategy}
            onChange={(e) => setConflictStrategy(e.target.value as typeof conflictStrategy)}
          >
            <option value="best_price">Best price</option>
            <option value="priority">Priority wins</option>
            <option value="exclusive">Exclusive</option>
          </select>
        </div>
        <label className="flex items-center gap-2 pt-7 text-sm">
          <input type="checkbox" checked={stackable} onChange={(e) => setStackable(e.target.checked)} />
          Stack with other eligible promotions
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CsvField
          id="eligible-items"
          label="Eligible product IDs"
          value={applicableItems}
          onChange={setApplicableItems}
        />
        <CsvField
          id="eligible-categories"
          label="Eligible category IDs"
          value={applicableCategories}
          onChange={setApplicableCategories}
        />
        <CsvField
          id="eligible-locations"
          label="Eligible location IDs"
          value={applicableLocations}
          onChange={setApplicableLocations}
        />
        <CsvField
          id="eligible-segments"
          label="Customer segments"
          value={eligibleCustomerSegments}
          onChange={setEligibleCustomerSegments}
          placeholder="rfm-vip, ltv-high, churn-risk"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="required-quantity">
            Mix & match quantity
          </label>
          <Input
            id="required-quantity"
            type="number"
            min={1}
            value={requiredQuantity}
            onChange={(e) => setRequiredQuantity(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="discount-mode">
            Combo discount mode
          </label>
          <select
            id="discount-mode"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={discountMode}
            onChange={(e) => setDiscountMode(e.target.value as typeof discountMode)}
          >
            <option value="fixed">Fixed amount</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="preview-subtotal">
            Preview subtotal
          </label>
          <Input id="preview-subtotal" value={previewSubtotal} onChange={(e) => setPreviewSubtotal(e.target.value)} />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium">Dynamic pricing rules</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={demandRule} onChange={(e) => setDemandRule(e.target.checked)} />
            Demand-based reduction
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={inventoryRule} onChange={(e) => setInventoryRule(e.target.checked)} />
            Low-stock discount reduction
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="time" value={happyHourStart} onChange={(e) => setHappyHourStart(e.target.value)} />
            <Input type="time" value={happyHourEnd} onChange={(e) => setHappyHourEnd(e.target.value)} />
          </div>
        </div>
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
      {preview ? (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
          <p className="font-medium">Impact preview</p>
          <p>Discount: {preview.discountTotal}</p>
          <p>Projected total: {preview.grandTotal}</p>
          <p>Discount rate: {preview.projectedDiscountRate}%</p>
          <p>Estimated margin impact: {preview.estimatedMarginImpact}</p>
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onPreview}>
          Preview impact
        </Button>
        <Button type="submit">{promotion ? 'Save promotion' : 'Create promotion'}</Button>
      </div>
    </form>
  );
}

function CsvField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function csv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
