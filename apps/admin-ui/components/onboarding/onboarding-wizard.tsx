'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BusinessTypeSelector,
  Button,
  Card,
  CardContent,
  CatalogStarter,
  Input,
  LocationForm,
  OnboardingLayout,
  ProgressIndicator,
  StepFooter,
  StepHeader,
} from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  completePaymentsStep,
  finalizeOnboarding,
  importSampleCatalog,
  saveBrandingStep,
  saveBusinessStep,
  saveCatalogStep,
  saveLocationStep,
} from '@/lib/api/onboarding';

const WIZARD_STEPS = [
  { id: 'business', label: 'Business' },
  { id: 'location', label: 'Location' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'branding', label: 'Branding' },
  { id: 'payments', label: 'Payments' },
  { id: 'complete', label: 'Done' },
] as const;

type WizardStepId = (typeof WIZARD_STEPS)[number]['id'];

const CURRENCIES = ['EUR', 'GBP', 'USD'] as const;
const TIMEZONES = ['Europe/Dublin', 'Europe/London', 'Europe/Paris', 'UTC'] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const client = useMemo(() => createBrowserApiClient(), []);
  const [step, setStep] = useState<WizardStepId>('business');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('retail');
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>('EUR');
  const [timezone, setTimezone] = useState<(typeof TIMEZONES)[number]>('Europe/Dublin');

  const [location, setLocation] = useState({
    locationName: 'Main Location',
    address: '',
    phone: '',
    pickupEnabled: true,
    deliveryEnabled: true,
  });

  const [catalog, setCatalog] = useState({
    categoryName: '',
    itemName: '',
    price: '',
  });

  const [branding, setBranding] = useState({
    logoUrl: '',
    primaryColor: '#0f766e',
    receiptHeader: '',
    receiptFooter: '',
  });

  const runStep = useCallback(
    async (action: () => Promise<void>) => {
      setError(null);
      setLoading(true);
      try {
        await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const goNext = useCallback(
    (next: WizardStepId) => {
      setStep(next);
    },
    [],
  );

  return (
    <OnboardingLayout>
      <ProgressIndicator steps={[...WIZARD_STEPS]} currentStepId={step} />
      <Card>
        <CardContent className="pt-6">
          {error ? <FormErrorAlert message={error} className="mb-4" /> : null}

          {step === 'business' ? (
            <>
              <StepHeader
                title="Business details"
                description="Tell us about your business. You can change these later in settings."
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="businessName">
                    Business name
                  </label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Business type</p>
                  <BusinessTypeSelector value={businessType} onChange={setBusinessType} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="currency">
                      Currency
                    </label>
                    <Select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as (typeof CURRENCIES)[number])}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="timezone">
                      Timezone
                    </label>
                    <Select
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value as (typeof TIMEZONES)[number])}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              <StepFooter
                nextLabel="Continue"
                nextDisabled={!businessName.trim()}
                loading={loading}
                onNext={() =>
                  runStep(async () => {
                    await saveBusinessStep(client, {
                      businessName: businessName.trim(),
                      businessType,
                      currency,
                      timezone,
                    });
                    goNext('location');
                  })
                }
              />
            </>
          ) : null}

          {step === 'location' ? (
            <>
              <StepHeader
                title="Location setup"
                description="Configure your primary location and fulfillment options."
              />
              <LocationForm values={location} onChange={(patch) => setLocation((v) => ({ ...v, ...patch }))} />
              <StepFooter
                onBack={() => setStep('business')}
                loading={loading}
                onNext={() =>
                  runStep(async () => {
                    await saveLocationStep(client, location);
                    goNext('catalog');
                  })
                }
              />
            </>
          ) : null}

          {step === 'catalog' ? (
            <>
              <StepHeader
                title="Catalog setup"
                description="Start with a sample catalog or add your first category and item."
              />
              <CatalogStarter
                values={catalog}
                onChange={(patch) => setCatalog((v) => ({ ...v, ...patch }))}
                importLoading={loading}
                onImportSample={() =>
                  runStep(async () => {
                    await importSampleCatalog(client);
                    await saveCatalogStep(client, {});
                    goNext('branding');
                  })
                }
              />
              <StepFooter
                onBack={() => setStep('location')}
                loading={loading}
                trailing={
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    onClick={() =>
                      runStep(async () => {
                        await saveCatalogStep(client, {});
                        goNext('branding');
                      })
                    }
                  >
                    Skip for now
                  </Button>
                }
                onNext={() =>
                  runStep(async () => {
                    const hasItem =
                      catalog.categoryName.trim() &&
                      catalog.itemName.trim() &&
                      catalog.price.trim();
                    await saveCatalogStep(
                      client,
                      hasItem
                        ? {
                            firstItem: {
                              categoryName: catalog.categoryName.trim(),
                              itemName: catalog.itemName.trim(),
                              price: catalog.price.trim(),
                            },
                          }
                        : {},
                    );
                    goNext('branding');
                  })
                }
              />
            </>
          ) : null}

          {step === 'branding' ? (
            <>
              <StepHeader
                title="Branding"
                description="Upload your logo and set colors for receipts and your storefront."
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="logoUrl">
                    Logo URL
                  </label>
                  <Input
                    id="logoUrl"
                    value={branding.logoUrl}
                    onChange={(e) => setBranding((v) => ({ ...v, logoUrl: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="primaryColor">
                    Brand color
                  </label>
                  <Input
                    id="primaryColor"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding((v) => ({ ...v, primaryColor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="receiptHeader">
                    Receipt header
                  </label>
                  <Input
                    id="receiptHeader"
                    value={branding.receiptHeader}
                    onChange={(e) => setBranding((v) => ({ ...v, receiptHeader: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="receiptFooter">
                    Receipt footer
                  </label>
                  <Input
                    id="receiptFooter"
                    value={branding.receiptFooter}
                    onChange={(e) => setBranding((v) => ({ ...v, receiptFooter: e.target.value }))}
                  />
                </div>
              </div>
              <StepFooter
                onBack={() => setStep('catalog')}
                loading={loading}
                onNext={() =>
                  runStep(async () => {
                    await saveBrandingStep(client, branding);
                    goNext('payments');
                  })
                }
              />
            </>
          ) : null}

          {step === 'payments' ? (
            <>
              <StepHeader
                title="Payments"
                description="Connect Stripe to accept card payments online and in-store."
              />
              <p className="text-sm text-muted-foreground">
                Payment connection is optional during setup. You can configure billing under
                settings when you are ready.
              </p>
              <StepFooter
                onBack={() => setStep('branding')}
                loading={loading}
                trailing={
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    onClick={() =>
                      runStep(async () => {
                        await completePaymentsStep(client);
                        await finalizeOnboarding(client);
                        goNext('complete');
                      })
                    }
                  >
                    Skip for now
                  </Button>
                }
                nextLabel="Mark payments configured"
                onNext={() =>
                  runStep(async () => {
                    await completePaymentsStep(client);
                    goNext('complete');
                  })
                }
              />
            </>
          ) : null}

          {step === 'complete' ? (
            <>
              <StepHeader
                title="You are all set"
                description="Your business is provisioned. Head to the dashboard to continue."
              />
              <StepFooter
                onBack={() => setStep('payments')}
                nextLabel="Go to dashboard"
                loading={loading}
                onNext={() =>
                  runStep(async () => {
                    await finalizeOnboarding(client);
                    router.push('/dashboard');
                    router.refresh();
                  })
                }
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </OnboardingLayout>
  );
}
