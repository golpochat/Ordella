'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  convertCurrency,
  getReportingDashboard,
  refreshFxRates,
  updateGlobalizationSettings,
  type ComplianceProfile,
  type CountryPrice,
  type FxRate,
  type GlobalizationDashboard,
  type TaxExemption,
} from '@/lib/api/admin/globalization';
import type { getGlobalizationSettings } from '@/lib/api/admin/globalization';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

import { PanelEmpty } from '@/components/ui/admin-empty-state';

type GlobalizationPanelProps = {
  dashboard: GlobalizationDashboard | null;
  settingsBundle: Awaited<ReturnType<typeof getGlobalizationSettings>> | null;
  fxRates: FxRate[];
  prices: CountryPrice[];
  exemptions: TaxExemption[];
  compliance: ComplianceProfile[];
  reporting: Record<string, unknown> | null;
};

export function GlobalizationPanel({
  dashboard,
  settingsBundle,
  fxRates: initialFx,
  prices: initialPrices,
  exemptions: initialExemptions,
  compliance: initialCompliance,
  reporting: initialReporting,
}: GlobalizationPanelProps) {
  const { success: toastSuccess, error: toastError } = useAdminToast();
  const api = useMemo(() => createBrowserApiClient(), []);
  const settings = settingsBundle?.settings ?? dashboard?.settings ?? null;
  const [fxRates, setFxRates] = useState(initialFx);
  const prices = initialPrices;
  const exemptions = initialExemptions;
  const compliance = initialCompliance;
  const [reporting, setReporting] = useState(initialReporting);
  const [baseCurrency, setBaseCurrency] = useState(settings?.baseCurrency ?? 'EUR');
  const [defaultLocale, setDefaultLocale] = useState(settings?.defaultLocale ?? 'en-IE');
  const [countries, setCountries] = useState((settings?.supportedCountries ?? []).join(', '));
  const [currencies, setCurrencies] = useState((settings?.supportedCurrencies ?? []).join(', '));
  const [convertAmount, setConvertAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('GBP');
  const [convertResult, setConvertResult] = useState<string | null>(null);
    async function saveSettings() {
    try {
      await updateGlobalizationSettings(api, {
        baseCurrency,
        defaultLocale,
        supportedCountries: countries.split(',').map((c) => c.trim()).filter(Boolean),
        supportedCurrencies: currencies.split(',').map((c) => c.trim()).filter(Boolean),
      });
      toastSuccess('Global settings saved.');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function runFxRefresh() {
    try {
      setFxRates(await refreshFxRates(api));
      toastSuccess('FX rates refreshed (fallback provider).');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function runConvert() {
    try {
      const result = await convertCurrency(api, {
        amount: Number(convertAmount),
        fromCurrency,
        toCurrency,
        context: 'order',
      });
      setConvertResult(JSON.stringify(result, null, 2));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function reloadReporting() {
    try {
      setReporting(await getReportingDashboard(api));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={4}>
        <Metric title="FX pairs" value={dashboard?.fxRatePairs ?? fxRates.length} />
        <Metric title="Country prices" value={dashboard?.countryPriceOverrides ?? prices.length} />
        <Metric title="Tax exemptions" value={dashboard?.taxExemptions ?? exemptions.length} />
        <Metric title="Compliance profiles" value={dashboard?.complianceProfiles ?? compliance.length} />
      </MetricGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Global settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Base currency" value={baseCurrency} onChange={setBaseCurrency} />
            <Field label="Default locale" value={defaultLocale} onChange={setDefaultLocale} />
            <Field label="Supported countries (comma-separated)" value={countries} onChange={setCountries} />
            <Field label="Supported currencies" value={currencies} onChange={setCurrencies} />
            <div className="flex flex-wrap gap-2">
              {(settings?.supportedCurrencies ?? []).map((c) => (
                <Tag key={c} variant="neutral"><TagLabel>{c}</TagLabel></Tag>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Rounding: {settings?.roundingMode ?? 'half_up'} · Dual pricing: {settings?.dualPricingEnabled ? 'on' : 'off'}
            </p>
            <Button type="button" onClick={() => void saveSettings()}>Save settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <Field label="Amount" value={convertAmount} onChange={setConvertAmount} />
              <Field label="From" value={fromCurrency} onChange={setFromCurrency} />
              <Field label="To" value={toCurrency} onChange={setToCurrency} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => void runFxRefresh()}>Refresh FX</Button>
              <Button type="button" onClick={() => void runConvert()}>Convert</Button>
            </div>
            {convertResult ? <pre className="overflow-auto rounded-md border p-3 text-xs">{convertResult}</pre> : null}
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Pair</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {fxRates.slice(0, 8).map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{rate.fromCurrency} → {rate.toCurrency}</TableCell>
                    <TableCell>{rate.rate}</TableCell>
                    <TableCell>{rate.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Location timezones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Timezone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {(settingsBundle?.locationTimezones ?? []).map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell>{loc.name}</TableCell>
                    <TableCell>{loc.timezone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Reporting (FX-normalized)</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => void reloadReporting()}>Refresh</Button>
          </CardHeader>
          <CardContent>
            {reporting ? (
              <pre className="overflow-auto rounded-md border p-3 text-xs">{JSON.stringify(reporting, null, 2)}</pre>
            ) : (
              <PanelEmpty title="No reporting snapshot loaded" description="Content will appear here when available." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax exemptions & compliance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {exemptions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.countryCode}</TableCell>
                  <TableCell>{row.exemptionType}</TableCell>
                  <TableCell>{row.customerId ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Privacy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {compliance.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.countryCode}</TableCell>
                  <TableCell>{row.invoiceFormat}</TableCell>
                  <TableCell>{row.privacyRegime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Country price lists</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {prices.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.countryCode} ({row.currency})</TableCell>
                  <TableCell className="font-mono text-xs">{row.productId.slice(0, 8)}…</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{formatDate(row.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}


function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
