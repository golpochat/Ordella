'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useEffect, useId, useMemo, useState, type HTMLInputTypeAttribute } from 'react';
import {
  Button,
  Card,
  CardContent,
  FormActions,
  FormField,
  FormLayout,
  Grid,
  Input,
  PageSection,
} from '@shared-ui';
import { DEFAULT_TENANT_SETTINGS, normalizeTenantSettings, type TenantSettings } from '@shared-utils';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  getTenantLocalizationSettings,
  updateTenantLocalizationSettings,
} from '@/lib/api/admin/settings';
import { getErrorMessage } from '@/lib/utils';
import { PanelCardsSkeleton } from '@/components/ui/admin-loader';

type LocalizationFieldKey =
  | 'currency'
  | 'currencySymbol'
  | 'locale'
  | 'timezone'
  | 'dateFormat'
  | 'numberFormat'
  | 'country'
  | 'defaultTaxRate';

const FIELD_DEFS: Array<{
  key: LocalizationFieldKey;
  label: string;
  helper?: string;
  type?: HTMLInputTypeAttribute;
  min?: number;
  step?: string;
  transform?: (value: string) => string;
}> = [
  {
    key: 'currency',
    label: 'Currency code',
    helper: 'ISO 4217 code (e.g. EUR, USD).',
    transform: (value) => value.toUpperCase(),
  },
  {
    key: 'currencySymbol',
    label: 'Currency symbol',
    helper: 'Displayed next to prices (e.g. €, $).',
  },
  {
    key: 'locale',
    label: 'Locale',
    helper: 'BCP 47 locale for formatting (e.g. en-IE).',
  },
  {
    key: 'timezone',
    label: 'Timezone',
    helper: 'IANA timezone (e.g. Europe/Dublin).',
  },
  {
    key: 'dateFormat',
    label: 'Date format',
    helper: 'Display pattern for dates (e.g. DD/MM/YYYY).',
  },
  {
    key: 'numberFormat',
    label: 'Number format',
    helper: 'Regional number grouping style.',
  },
  {
    key: 'country',
    label: 'Country code',
    helper: 'ISO 3166-1 alpha-2 (e.g. IE, US).',
    transform: (value) => value.toUpperCase(),
  },
  {
    key: 'defaultTaxRate',
    label: 'Default tax rate',
    helper: 'Decimal rate applied when no product tax is set.',
    type: 'number',
    min: 0,
    step: '0.0001',
  },
];

export function TenantLocalizationPanel() {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const baseId = useId();
  const api = useMemo(() => createBrowserApiClient(), []);
  const [settings, setSettings] = useState<TenantSettings>(DEFAULT_TENANT_SETTINGS);
    const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {

    let cancelled = false;

    getTenantLocalizationSettings(api)
      .then((data) => {
        if (!cancelled) setSettings(normalizeTenantSettings(data));
      })
      .catch((err) => {
        if (!cancelled) toastError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api]);

  async function save() {
    setSaving(true);
    try {
      const saved = await updateTenantLocalizationSettings(api, {
        ...settings,
        defaultTaxRate: Number(settings.defaultTaxRate),
      });
      setSettings(normalizeTenantSettings((saved as { data?: unknown }).data ?? settings));
      toastSuccess('Tenant localization settings saved');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function updateField(key: LocalizationFieldKey, raw: string) {
    const def = FIELD_DEFS.find((field) => field.key === key);
    const value = def?.transform ? def.transform(raw) : raw;
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <PageSection
        title="Tenant Settings & Localization"
        description="Currency, locale, and regional defaults for this tenant."
      >
        <PanelCardsSkeleton count={1} />
      </PageSection>
    );
  }

  return (
    <PageSection
      title="Tenant Settings & Localization"
      description="Currency, locale, and regional defaults for this tenant."
    >
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <FormLayout>
            <Grid cols={1} gap="md" className="min-[769px]:grid-cols-2">
              {FIELD_DEFS.map((field) => {
                const inputId = `${baseId}-${field.key}`;
                const value = settings[field.key];
                return (
                  <FormField
                    key={field.key}
                    label={field.label}
                    htmlFor={inputId}
                    helper={field.helper}
                  >
                    <Input
                      id={inputId}
                      name={field.key}
                      type={field.type ?? 'text'}
                      min={field.min}
                      step={field.step}
                      value={String(value)}
                      disabled={saving}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      autoComplete="off"
                    />
                  </FormField>
                );
              })}
            </Grid>

            <p className="text-xs text-muted-foreground">
              Defaults: EUR, €, en-IE, Europe/Dublin, DD/MM/YYYY.
            </p>

            <FormActions>
              <Button type="button" isLoading={saving} loadingLabel="Saving…" onClick={save}>
                Save tenant settings
              </Button>
            </FormActions>
          </FormLayout>
        </CardContent>
      </Card>
    </PageSection>
  );
}
