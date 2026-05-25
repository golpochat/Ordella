'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  updateBusinessInfo,
  updateDeliveryZones,
  updateOpeningHours,
  updatePaymentSettings,
} from '@/lib/api/admin/settings';
import { SETTINGS_TABS } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { BillingPanel } from './billing-panel';
import { BrandingPanel } from './branding-panel';
import { FulfillmentDisplayPanel } from './fulfillment-display-panel';
import { DeliverySettingsPanel } from './delivery-settings-panel';
import { StorefrontThemePanel } from './storefront-theme-panel';
import { OfflineModePanel } from './offline-mode-panel';
import { TaxCompliancePanel } from './tax-compliance-panel';
import { OrderRoutingPanel } from './order-routing-panel';
import { EnterpriseSsoPanel } from './enterprise-sso-panel';

function SettingsSection({
  title,
  children,
  onSave,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => Promise<void>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await onSave();
      setMessage('Saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button onClick={save} disabled={loading}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}

export function SettingsForms() {
  const api = createBrowserApiClient();
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [hoursJson, setHoursJson] = useState('{"monday":{"open":"09:00","close":"22:00"}}');
  const [zonesJson, setZonesJson] = useState('[]');
  const [paymentJson, setPaymentJson] = useState('{}');

  return (
    <Tabs defaultValue={SETTINGS_TABS[0].id}>
      <TabsList>
        {SETTINGS_TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="billing" className="mt-4">
        <BillingPanel />
      </TabsContent>
      <TabsContent value="branding" className="mt-4">
        <BrandingPanel />
      </TabsContent>
      <TabsContent value="storefront-theme" className="mt-4">
        <StorefrontThemePanel />
      </TabsContent>
      <TabsContent value="business" className="mt-4">
        <SettingsSection
          title="Business info"
          onSave={async () => {
            await updateBusinessInfo(api, { name: businessName, slug });
          }}
        >
          <Input placeholder="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </SettingsSection>
      </TabsContent>
      <TabsContent value="hours" className="mt-4">
        <SettingsSection
          title="Opening hours"
          onSave={async () => {
            await updateOpeningHours(api, JSON.parse(hoursJson) as Record<string, unknown>);
          }}
        >
          <textarea
            className="min-h-32 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            value={hoursJson}
            onChange={(e) => setHoursJson(e.target.value)}
          />
        </SettingsSection>
      </TabsContent>
      <TabsContent value="delivery" className="mt-4 space-y-4">
        <DeliverySettingsPanel />
        <SettingsSection
          title="Delivery zones"
          onSave={async () => {
            await updateDeliveryZones(api, JSON.parse(zonesJson) as Record<string, unknown>);
          }}
        >
          <textarea
            className="min-h-32 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            value={zonesJson}
            onChange={(e) => setZonesJson(e.target.value)}
          />
        </SettingsSection>
      </TabsContent>
      <TabsContent value="order-routing" className="mt-4">
        <OrderRoutingPanel />
      </TabsContent>
      <TabsContent value="enterprise-sso" className="mt-4">
        <EnterpriseSsoPanel />
      </TabsContent>
      <TabsContent value="payment" className="mt-4">
        <SettingsSection
          title="Payment settings"
          onSave={async () => {
            await updatePaymentSettings(api, JSON.parse(paymentJson) as Record<string, unknown>);
          }}
        >
          <textarea
            className="min-h-32 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            value={paymentJson}
            onChange={(e) => setPaymentJson(e.target.value)}
          />
        </SettingsSection>
      </TabsContent>
      <TabsContent value="pos" className="mt-4">
        <OfflineModePanel />
      </TabsContent>
      <TabsContent value="tax-compliance" className="mt-4">
        <TaxCompliancePanel />
      </TabsContent>
      <TabsContent value="fulfillment" className="mt-4">
        <FulfillmentDisplayPanel />
      </TabsContent>
    </Tabs>
  );
}
