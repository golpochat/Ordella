'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  approveMarketplaceApp,
  createAppReview,
  installMarketplaceApp,
  meterAppUsage,
  registerAppPartner,
  submitMarketplaceApp,
  uninstallMarketplaceApp,
  type AppStoreAnalytics,
  type MarketplaceApp,
  type PartnerDashboard,
} from '@/lib/api/admin/app-store';
import { getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';
import { IrreversibleConfirmDialog } from '@/components/ui/admin-dialog';

import { PanelEmpty } from '@/components/ui/admin-empty-state';
import { SearchBar, SearchInput } from '@/components/ui/admin-search';

const CATEGORIES = ['all', 'accounting', 'erp', 'delivery', 'marketing', 'hardware'];
const DEFAULT_SCOPES = ['orders.read', 'products.read', 'inventory.read', 'customers.read'];

export function AppStorePanel({
  initialApps,
  initialAnalytics,
  initialPartnerDashboard,
}: {
  initialApps: MarketplaceApp[];
  initialAnalytics: AppStoreAnalytics;
  initialPartnerDashboard: PartnerDashboard;
}) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const [apps, setApps] = useState(initialApps);
  const [analytics] = useState(initialAnalytics);
  const [partnerDashboard, setPartnerDashboard] = useState(initialPartnerDashboard);
  const [selectedAppId, setSelectedAppId] = useState(initialApps[0]?.id ?? '');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [grantedScopes, setGrantedScopes] = useState<string[]>(initialApps[0]?.requestedScopes ?? []);
  const [webhookEvents, setWebhookEvents] = useState<string[]>(initialApps[0]?.webhookEvents ?? []);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [partnerForm, setPartnerForm] = useState({ companyName: '', contactName: '', email: '' });
  const [submissionForm, setSubmissionForm] = useState({
    name: '',
    description: '',
    provider: '',
    category: 'marketing',
    pricingModel: 'free',
    priceCents: 0,
    requestedScopes: DEFAULT_SCOPES,
  });
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);
  const [uninstallOpen, setUninstallOpen] = useState(false);
  const [uninstallLoading, setUninstallLoading] = useState(false);
    const selectedApp = apps.find((app) => app.id === selectedAppId) ?? apps[0];
  const visibleApps = useMemo(() => apps.filter((app) => {

    const categoryMatches = category === 'all' || app.category === category;
    const searchMatches = !search || `${app.name} ${app.provider} ${app.description}`.toLowerCase().includes(search.toLowerCase());
    return categoryMatches && searchMatches;
  }), [apps, category, search]);

  function selectApp(app: MarketplaceApp) {
    setSelectedAppId(app.id);
    setGrantedScopes(app.requestedScopes);
    setWebhookEvents(app.webhookEvents);
  }

  async function installSelected() {
    if (!selectedApp) return;
    try {
      const result = await installMarketplaceApp(createBrowserApiClient(), selectedApp.id, {
        grantedScopes,
        webhookEvents,
        ...(webhookUrl ? { webhookUrl } : {}),
      });
      setRevealedApiKey(result.apiKey ?? null);
      setApps((current) => current.map((app) => (app.id === selectedApp.id ? { ...app, installation: result.installation } : app)));
      toastSuccess(`${selectedApp.name} installed with approved permissions`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function confirmUninstall() {
    if (!selectedApp?.installation) return;
    setUninstallLoading(true);
    try {
      await uninstallMarketplaceApp(createBrowserApiClient(), selectedApp.installation.id);
      setApps((current) => current.map((app) => (app.id === selectedApp.id ? { ...app, installation: { ...selectedApp.installation!, status: 'uninstalled' } } : app)));
      setUninstallOpen(false);
      toastSuccess(`${selectedApp.name} uninstalled`);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setUninstallLoading(false);
    }
  }

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedApp) return;
    try {
      await createAppReview(createBrowserApiClient(), selectedApp.id, { rating, comment: reviewComment });
      setApps((current) => current.map((app) => (app.id === selectedApp.id ? { ...app, reviewCount: app.reviewCount + 1 } : app)));
      setReviewComment('');
      toastSuccess('Review submitted');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function registerPartner(event: React.FormEvent) {
    event.preventDefault();
    try {
      const partner = await registerAppPartner(createBrowserApiClient(), partnerForm);
      setPartnerDashboard((current) => ({ ...current, partner }));
      toastSuccess('Partner sandbox enabled');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function submitApp(event: React.FormEvent) {
    event.preventDefault();
    try {
      const app = await submitMarketplaceApp(createBrowserApiClient(), {
        partnerId: partnerDashboard.partner?.id,
        ...submissionForm,
        requestedScopes: submissionForm.requestedScopes,
      });
      setApps((current) => [app, ...current]);
      toastSuccess(app.clientSecret ? `App submitted. Client secret: ${app.clientSecret}` : 'App submitted');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function approve(app: MarketplaceApp) {
    try {
      const updated = await approveMarketplaceApp(createBrowserApiClient(), app.id, 'approved');
      setApps((current) => current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      toastSuccess('App approved');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function meterUsage() {
    if (!selectedApp?.installation) return;
    try {
      await meterAppUsage(createBrowserApiClient(), selectedApp.installation.id, { metric: 'api_calls', quantity: 100 });
      toastSuccess('Usage metered for billing');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  function toggleScope(scope: string) {
    setGrantedScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  }

  function toggleWebhook(event: string) {
    setWebhookEvents((current) => current.includes(event) ? current.filter((item) => item !== event) : [...current, event]);
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <IrreversibleConfirmDialog
        open={uninstallOpen}
        onOpenChange={setUninstallOpen}
        title={selectedApp ? `Uninstall ${selectedApp.name}?` : 'Uninstall app?'}
        description="Granted scopes and webhooks for this app will be revoked."
        confirmLabel="Uninstall"
        loading={uninstallLoading}
        onConfirm={confirmUninstall}
      />
      {revealedApiKey ? (
        <div className="rounded-md border bg-muted/40 p-3">
          <p className="text-sm font-medium">App API key shown once</p>
          <code className="mt-2 block break-all text-sm">{revealedApiKey}</code>
        </div>
      ) : null}

      <MetricGrid columns={4}>
        <MetricCard title="Top apps" value={String(analytics.topApps.length)} detail="Ranked by installs" />
        <MetricCard title="Install events" value={String(analytics.installTrends.length)} detail="Tenant install history" />
        <MetricCard title="Revenue" value={money(analytics.partnerEarningsCents)} detail="Marketplace billing records" />
        <MetricCard title="Reviews" value={String(analytics.reviewCount)} detail="Published ratings" />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle>Browse Apps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <SearchBar className="min-[481px]:max-w-none">
              <SearchInput
                placeholder="Search apps, providers, or descriptions"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch('')}
                active={Boolean(search.trim())}
                aria-label="Search marketplace apps"
              />
            </SearchBar>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <Button key={item} type="button" size="sm" variant={category === item ? 'brand' : 'outline'} onClick={() => setCategory(item)}>
                  {item === 'all' ? 'All' : item}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleApps.map((app) => (
              <button key={app.id} type="button" className="rounded-md border bg-background p-4 text-left" onClick={() => selectApp(app)}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{app.name}</p>
                  <Tag variant={app.installation?.status === 'installed' ? 'outline' : 'neutral'}><TagLabel>{app.installation?.status ?? app.pricingModel}</TagLabel></Tag>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{app.provider} - {app.category}</p>
                <p className="mt-2 line-clamp-2 text-sm">{app.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{app.averageRating.toFixed(1)} stars / {app.reviewCount} reviews</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedApp ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>{selectedApp.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedApp.description}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <Info label="Pricing" value={pricingText(selectedApp)} />
                <Info label="Rate limit" value={`${selectedApp.rateLimitPerMinute}/min`} />
                <Info label="OAuth client" value={selectedApp.oauthClientId ?? 'Pending'} />
              </div>
              <div>
                <p className="mb-2 font-medium">Permission prompt</p>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.requestedScopes.map((scope) => (
                    <label key={scope} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                      <input type="checkbox" checked={grantedScopes.includes(scope)} onChange={() => toggleScope(scope)} />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-medium">Webhook access</p>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.webhookEvents.length ? selectedApp.webhookEvents.map((event) => (
                    <label key={event} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                      <input type="checkbox" checked={webhookEvents.includes(event)} onChange={() => toggleWebhook(event)} />
                      {event}
                    </label>
                  )) : <PanelEmpty title="No webhook events requested" description="Content will appear here when available." />}
                </div>
              </div>
              <Input placeholder="Optional webhook URL" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => void installSelected()} disabled={selectedApp.installation?.status === 'installed'}>Install app</Button>
                <Button type="button" variant="error" onClick={() => setUninstallOpen(true)} disabled={selectedApp.installation?.status !== 'installed'}>Uninstall</Button>
                <Button type="button" variant="outline" onClick={() => void meterUsage()} disabled={!selectedApp.installation}>Meter 100 API calls</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews & Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-3" onSubmit={submitReview}>
                <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                  {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
                </Select>
                <Input placeholder="Leave a review" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} />
                <Button type="submit" size="sm">Submit review</Button>
              </form>
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">Billing engine</p>
                <p className="mt-1 text-muted-foreground">
                  Supports one-time purchases, subscriptions, metered API/order usage, revenue share, invoices, receipts, and partner payouts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Partner Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Info label="Partner" value={partnerDashboard.partner?.companyName ?? 'Not registered'} />
            <Info label="Apps" value={String(partnerDashboard.apps.length)} />
            <Info label="Installs" value={String(partnerDashboard.installs)} />
            <Info label="Revenue" value={money(partnerDashboard.revenueCents)} />
          </div>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={registerPartner}>
            <Input placeholder="Company" value={partnerForm.companyName} onChange={(event) => setPartnerForm((current) => ({ ...current, companyName: event.target.value }))} required />
            <Input placeholder="Contact" value={partnerForm.contactName} onChange={(event) => setPartnerForm((current) => ({ ...current, contactName: event.target.value }))} required />
            <Input placeholder="Email" type="email" value={partnerForm.email} onChange={(event) => setPartnerForm((current) => ({ ...current, email: event.target.value }))} required />
            <Button type="submit">Register developer</Button>
          </form>
          <form className="space-y-3" onSubmit={submitApp}>
            <div className="grid gap-3 md:grid-cols-3">
              <Input placeholder="App name" value={submissionForm.name} onChange={(event) => setSubmissionForm((current) => ({ ...current, name: event.target.value }))} required />
              <Input placeholder="Provider" value={submissionForm.provider} onChange={(event) => setSubmissionForm((current) => ({ ...current, provider: event.target.value }))} required />
              <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={submissionForm.pricingModel} onChange={(event) => setSubmissionForm((current) => ({ ...current, pricingModel: event.target.value }))}>
                <option value="free">Free</option>
                <option value="one_time">One-time</option>
                <option value="monthly_subscription">Monthly</option>
                <option value="usage_based">Usage-based</option>
                <option value="revenue_share">Revenue share</option>
              </Select>
            </div>
            <Input placeholder="Description" value={submissionForm.description} onChange={(event) => setSubmissionForm((current) => ({ ...current, description: event.target.value }))} required />
            <Button type="submit">Submit app for approval</Button>
          </form>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Submitted app</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead className="text-right">Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {apps.filter((app) => app.status !== 'approved').map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.name}</TableCell>
                  <TableCell><Tag variant="neutral"><TagLabel>{app.status}</TagLabel></Tag></TableCell>
                  <TableCell>{pricingText(app)}</TableCell>
                  <TableCell className="text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => void approve(app)}>Approve</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}


function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function pricingText(app: MarketplaceApp) {
  if (app.pricingModel === 'free') return 'Free';
  if (app.pricingModel === 'one_time') return `${money(app.priceCents)} one-time`;
  if (app.pricingModel === 'monthly_subscription') return `${money(app.priceCents)}/mo`;
  if (app.pricingModel === 'usage_based') return `${money(app.priceCents)} per ${app.usageUnit ?? 'unit'}`;
  if (app.pricingModel === 'revenue_share') return `${app.revenueShareBps / 100}% revenue share`;
  return app.pricingModel;
}

function money(cents: number) {
  return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
