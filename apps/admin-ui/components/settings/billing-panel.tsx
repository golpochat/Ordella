'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input , Stack } from '@shared-ui';
import {
  attachBillingPaymentMethod,
  cancelBillingSubscription,
  changeBillingPlan,
  createBillingPortalSession,
  createSubscriptionCheckout,
  fetchBillingInvoices,
  fetchBillingSummary,
  subscribeToPlan,
  type BillingInvoice,
  type BillingSummary,
} from '@/lib/api/billing';
import { getErrorMessage } from '@/lib/utils';
import { PanelCardsSkeleton } from '@/components/ui/admin-loader';
import { FormErrorAlert } from '@/components/ui/admin-form-validation';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { PanelEmpty } from '@/components/ui/admin-empty-state';

function formatLimit(value: number | null, formatNumber: (value: number) => string): string {
  if (value === null) return 'Unlimited';
  return formatNumber(value);
}

function usagePercent(used: number, limit: number | null): number | null {
  if (limit === null || limit === 0) return null;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function BillingPanel() {
  const { formatCurrency, formatDate, formatNumber } = useTenantSettings();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [billing, invoiceList] = await Promise.all([
        fetchBillingSummary(),
        fetchBillingInvoices(),
      ]);
      setSummary(billing);
      setInvoices(invoiceList);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(action: () => Promise<void>) {
    setLoading(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  if (!summary) {
    return error ? (
      <FormErrorAlert message={error} title="Unable to load billing" />
    ) : (
      <PanelCardsSkeleton count={2} />
    );
  }

  const { usage } = summary;
  const orderPct = usagePercent(usage.ordersUsed, usage.orderLimit);
  const locationPct = usagePercent(usage.locationsUsed, usage.locationLimit);
  const onTrial = summary.subscriptionStatus === 'trialing' && summary.trialEndsAt;

  return (
    <Stack gap="lg" className="min-w-0">
      <FormErrorAlert message={error} title="Billing action failed" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Business billing</CardTitle>
            <p className="text-sm text-muted-foreground">
              {summary.planName} · {summary.subscriptionStatus}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onTrial ? (
              <Tag variant="neutral"><TagLabel>
                Trial ends {formatDate(summary.trialEndsAt!)}
              </TagLabel></Tag>
            ) : null}
            {usage.softLimitWarned ? <Tag variant="neutral"><TagLabel>Approaching limits</TagLabel></Tag> : null}
            {usage.hardLimitExceeded ? <Tag variant="error"><TagLabel>Limit exceeded</TagLabel></Tag> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={loading || !summary.stripeConfigured}
              onClick={() =>
                void runAction(async () => {
                  const { url } = await createBillingPortalSession(
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/settings/billing`
                      : undefined,
                  );
                  window.location.href = url;
                })
              }
            >
              Manage payment method
            </Button>
            {summary.plan !== 'free' ? (
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() =>
                  void runAction(async () => {
                    await cancelBillingSubscription();
                  })
                }
              >
                Cancel subscription
              </Button>
            ) : null}
          </div>
          {summary.currentPeriodEnd ? (
            <p className="text-muted-foreground">
              Billing period ends {formatDate(summary.currentPeriodEnd)}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-medium">Orders this month</p>
              <p>
                {formatNumber(usage.ordersUsed)} / {formatLimit(usage.orderLimit, formatNumber)}
                {orderPct !== null ? ` (${orderPct}%)` : ''}
              </p>
            </div>
            <div>
              <p className="font-medium">Locations</p>
              <p>
                {formatNumber(usage.locationsUsed)} / {formatLimit(usage.locationLimit, formatNumber)}
                {locationPct !== null ? ` (${locationPct}%)` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change plan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {summary.plans.map((plan) => (
            <Button
              key={plan.id}
              size="sm"
              variant={summary.plan === plan.id ? 'brand' : 'outline'}
              disabled={loading || summary.plan === plan.id || plan.custom}
              onClick={() =>
                void runAction(async () => {
                  if (plan.custom) return;
                  if (summary.stripeConfigured && summary.plan === 'free' && plan.id !== 'free') {
                    const { url } = await createSubscriptionCheckout(plan.id);
                    window.location.href = url;
                    return;
                  }
                  if (summary.plan === 'free' && plan.id !== 'free') {
                    await subscribeToPlan(plan.id, paymentMethodId || undefined);
                  } else {
                    await changeBillingPlan(plan.id);
                  }
                })
              }
            >
              {plan.name}
              {plan.custom ? ' (contact sales)' : ''}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.paymentMethod.last4 ? (
            <p className="text-sm">
              {String(summary.paymentMethod.brand ?? 'Card')} ending in{' '}
              {String(summary.paymentMethod.last4)}
            </p>
          ) : (
            <PanelEmpty title="No payment method on file" description="Content will appear here when available." />
          )}
          <Input
            placeholder="Stripe payment method ID (pm_…)"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
          />
          <Button
            size="sm"
            disabled={loading || !paymentMethodId.trim()}
            onClick={() =>
              void runAction(() => attachBillingPaymentMethod(paymentMethodId.trim()))
            }
          >
            Save payment method
          </Button>
          {!summary.stripeConfigured ? (
            <p className="text-xs text-muted-foreground">
              Stripe is not configured on the API — placeholder mode is active.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <PanelEmpty title="No invoices yet" description="Content will appear here when available." />
          ) : (
            <ul className="divide-y text-sm">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    {formatDate(inv.created)} · {formatCurrency(inv.amountDue / 100)}{' '}
                    {inv.currency?.toUpperCase()} · {inv.status}
                  </span>
                  {inv.hostedInvoiceUrl ? (
                    <a
                      href={inv.hostedInvoiceUrl}
                      className="text-primary underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
