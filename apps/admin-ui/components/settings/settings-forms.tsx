'use client';

import { useId, useState } from 'react';
import { Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  updateBusinessInfo,
  updateDeliveryZones,
  updateOpeningHours,
  updatePaymentSettings,
} from '@/lib/api/admin/settings';
import { SETTINGS_TABS } from '@/lib/navigation';
import {
  FormField,
  FormLayout,
  Grid,
  JsonEditorField,
  SettingsSection,
} from '@/components/ui/admin-form';
import { BillingPanel } from './billing-panel';
import { BrandingPanel } from './branding-panel';
import { FulfillmentDisplayPanel } from './fulfillment-display-panel';
import { DeliverySettingsPanel } from './delivery-settings-panel';
import { StorefrontThemePanel } from './storefront-theme-panel';
import { OfflineModePanel } from './offline-mode-panel';
import { PosThemePanel } from './pos-theme-panel';
import { TaxCompliancePanel } from './tax-compliance-panel';
import { OrderRoutingPanel } from './order-routing-panel';
import { EnterpriseSsoPanel } from './enterprise-sso-panel';
import { TenantLocalizationPanel } from './tenant-localization-panel';
import { useTranslation } from '@/components/ui/admin-i18n';

export function SettingsForms() {
  const { t } = useTranslation();
  const baseId = useId();
  const api = createBrowserApiClient();
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [hoursJson, setHoursJson] = useState('{"monday":{"open":"09:00","close":"22:00"}}');
  const [zonesJson, setZonesJson] = useState('[]');
  const [paymentJson, setPaymentJson] = useState('{}');

  return (
    <Tabs defaultValue={SETTINGS_TABS[0].id} className="min-w-0 w-full">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
        {SETTINGS_TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="text-sm">
            {t(tab.labelKey)}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="localization" className="mt-6 min-w-0 focus-visible:outline-none">
        <TenantLocalizationPanel />
      </TabsContent>

      <TabsContent value="billing" className="mt-6 min-w-0 focus-visible:outline-none">
        <BillingPanel />
      </TabsContent>

      <TabsContent value="branding" className="mt-6 min-w-0 focus-visible:outline-none">
        <BrandingPanel />
      </TabsContent>

      <TabsContent value="storefront-theme" className="mt-6 min-w-0 focus-visible:outline-none">
        <StorefrontThemePanel />
      </TabsContent>

      <TabsContent value="business" className="mt-6 min-w-0 focus-visible:outline-none">
        <SettingsSection
          title="Business info"
          description="Legal name and URL slug for this tenant."
          onSave={async () => {
            await updateBusinessInfo(api, { name: businessName, slug });
          }}
        >
          <Grid cols={1} gap="md" className="min-[769px]:grid-cols-2">
            <FormField label="Business name" htmlFor={`${baseId}-business-name`} className="min-[769px]:col-span-2">
              <Input
                id={`${baseId}-business-name`}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </FormField>
            <FormField label="Slug" htmlFor={`${baseId}-slug`} helper="URL-safe identifier for this tenant.">
              <Input id={`${baseId}-slug`} value={slug} onChange={(e) => setSlug(e.target.value)} />
            </FormField>
          </Grid>
        </SettingsSection>
      </TabsContent>

      <TabsContent value="hours" className="mt-6 min-w-0 focus-visible:outline-none">
        <SettingsSection
          title="Opening hours"
          description="Weekly schedule as JSON."
          onSave={async () => {
            await updateOpeningHours(api, JSON.parse(hoursJson) as Record<string, unknown>);
          }}
        >
          <JsonEditorField
            id={`${baseId}-hours`}
            label="Opening hours JSON"
            value={hoursJson}
            onChange={setHoursJson}
          />
        </SettingsSection>
      </TabsContent>

      <TabsContent value="delivery" className="mt-6 min-w-0 focus-visible:outline-none">
        <FormLayout constrained={false}>
          <DeliverySettingsPanel />
          <SettingsSection
            title="Delivery zones"
            description="Zone polygons and fees as JSON."
            onSave={async () => {
              await updateDeliveryZones(api, JSON.parse(zonesJson) as Record<string, unknown>);
            }}
          >
            <JsonEditorField
              id={`${baseId}-zones`}
              label="Delivery zones JSON"
              value={zonesJson}
              onChange={setZonesJson}
            />
          </SettingsSection>
        </FormLayout>
      </TabsContent>

      <TabsContent value="order-routing" className="mt-6 min-w-0 focus-visible:outline-none">
        <OrderRoutingPanel />
      </TabsContent>

      <TabsContent value="enterprise-sso" className="mt-6 min-w-0 focus-visible:outline-none">
        <EnterpriseSsoPanel />
      </TabsContent>

      <TabsContent value="payment" className="mt-6 min-w-0 focus-visible:outline-none">
        <SettingsSection
          title="Payment settings"
          description="Gateway and tender configuration as JSON."
          onSave={async () => {
            await updatePaymentSettings(api, JSON.parse(paymentJson) as Record<string, unknown>);
          }}
        >
          <JsonEditorField
            id={`${baseId}-payment`}
            label="Payment settings JSON"
            value={paymentJson}
            onChange={setPaymentJson}
          />
        </SettingsSection>
      </TabsContent>

      <TabsContent value="pos" className="mt-6 min-w-0 focus-visible:outline-none">
        <OfflineModePanel />
      </TabsContent>

      <TabsContent value="pos-theme" className="mt-6 min-w-0 focus-visible:outline-none">
        <PosThemePanel />
      </TabsContent>

      <TabsContent value="tax-compliance" className="mt-6 min-w-0 focus-visible:outline-none">
        <TaxCompliancePanel />
      </TabsContent>

      <TabsContent value="fulfillment" className="mt-6 min-w-0 focus-visible:outline-none">
        <FulfillmentDisplayPanel />
      </TabsContent>
    </Tabs>
  );
}
