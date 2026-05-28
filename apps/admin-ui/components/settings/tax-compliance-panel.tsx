'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useEffect, useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import {
  getTaxReport,
  listTaxCategories,
  listTaxRules,
  saveTaxCategory,
  saveTaxRule,
  type TaxCategory,
  type TaxRule,
  type TaxRulePayload,
} from '@/lib/api/admin/tax';
import { getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Metric, MetricCard, MetricGrid, StatTile } from '@/components/ui/admin-card';

const DEFAULT_RULE: TaxRulePayload = {
  country: 'IE',
  taxName: 'Standard VAT',
  taxRate: 23,
  taxType: 'vat',
  appliesTo: ['items', 'delivery', 'service_fee'],
  priceMode: 'inclusive',
  isDefault: true,
};

function taxTypeLabel(type: TaxRule['taxType']) {
  if (type === 'vat') return 'VAT';
  if (type === 'gst') return 'GST';
  return 'Sales tax';
}

export function TaxCompliancePanel() {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = useMemo(() => createBrowserApiClient(), []);
  const { settings, formatCurrency } = useTenantSettings();
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [ruleDraft, setRuleDraft] = useState<TaxRulePayload>(DEFAULT_RULE);
  const [categoryDraft, setCategoryDraft] = useState({ name: '', description: '', defaultTaxRuleId: '' });
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(false);

  useEffect(() => {

    void refresh();
  }, []);

  useEffect(() => {
    setRuleDraft((current) => ({
      ...current,
      country: settings.country,
      taxRate: Number(settings.defaultTaxRate) || current.taxRate,
    }));
  }, [settings.country, settings.defaultTaxRate]);

  async function refresh() {
    try {
      const [nextLocations, nextRules, nextCategories, nextReport] = await Promise.all([
        fetchLocations(),
        listTaxRules(api),
        listTaxCategories(api),
        getTaxReport(api),
      ]);
      setLocations(nextLocations);
      setRules(nextRules);
      setCategories(nextCategories);
      setReport(nextReport);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function saveRule() {
    setLoading(true);
    try {
      await saveTaxRule(api, {
        ...ruleDraft,
        region: ruleDraft.region || undefined,
        locationId: ruleDraft.locationId || undefined,
        taxIdLabel: ruleDraft.taxIdLabel || undefined,
        taxIdValue: ruleDraft.taxIdValue || undefined,
      });
      setRuleDraft(DEFAULT_RULE);
      toastSuccess('Tax rule saved');
      await refresh();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveCategory() {
    if (!categoryDraft.name.trim()) return;
    setLoading(true);
    try {
      await saveTaxCategory(api, {
        name: categoryDraft.name,
        description: categoryDraft.description || undefined,
        defaultTaxRuleId: categoryDraft.defaultTaxRuleId || undefined,
      });
      setCategoryDraft({ name: '', description: '', defaultTaxRuleId: '' });
      toastSuccess('Tax category saved');
      await refresh();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const summary = report?.summary as { taxableAmount?: string; taxCollected?: string; lineCount?: number } | undefined;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tax dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricGrid columns={3}>
            <StatTile label="Default rule" value={rules.find((rule) => rule.isDefault)?.taxName ?? 'Not configured'} />
            <StatTile label="Active rules" value={rules.length} />
            <StatTile label="Tax collected" value={formatCurrency(summary?.taxCollected ?? '0.00')} />
          </MetricGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax rule editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Tax name" value={ruleDraft.taxName} onChange={(e) => setRuleDraft({ ...ruleDraft, taxName: e.target.value })} />
            <Input type="number" min={0} step="0.01" placeholder="Rate %" value={ruleDraft.taxRate} onChange={(e) => setRuleDraft({ ...ruleDraft, taxRate: Number(e.target.value) || 0 })} />
            <Input placeholder="Country code" value={ruleDraft.country} onChange={(e) => setRuleDraft({ ...ruleDraft, country: e.target.value.toUpperCase() })} />
            <Input placeholder="Region (optional)" value={ruleDraft.region ?? ''} onChange={(e) => setRuleDraft({ ...ruleDraft, region: e.target.value })} />
            <Select className="h-10 rounded-md border border-input bg-background px-3" value={ruleDraft.taxType} onChange={(e) => setRuleDraft({ ...ruleDraft, taxType: e.target.value as TaxRulePayload['taxType'] })}>
              <option value="vat">VAT</option>
              <option value="gst">GST</option>
              <option value="sales_tax">Sales tax</option>
            </Select>
            <Select className="h-10 rounded-md border border-input bg-background px-3" value={ruleDraft.priceMode} onChange={(e) => setRuleDraft({ ...ruleDraft, priceMode: e.target.value as TaxRulePayload['priceMode'] })}>
              <option value="exclusive">Tax exclusive</option>
              <option value="inclusive">Tax inclusive</option>
            </Select>
            <Select className="h-10 rounded-md border border-input bg-background px-3" value={ruleDraft.locationId ?? ''} onChange={(e) => setRuleDraft({ ...ruleDraft, locationId: e.target.value || undefined })}>
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </Select>
            <Input placeholder="Tax ID label (VAT number, GST number)" value={ruleDraft.taxIdLabel ?? ''} onChange={(e) => setRuleDraft({ ...ruleDraft, taxIdLabel: e.target.value })} />
            <Input placeholder="Tax ID value" value={ruleDraft.taxIdValue ?? ''} onChange={(e) => setRuleDraft({ ...ruleDraft, taxIdValue: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {(['items', 'categories', 'delivery', 'service_fee'] as TaxRulePayload['appliesTo']).map((target) => (
              <label key={target} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ruleDraft.appliesTo.includes(target)}
                  onChange={(e) => {
                    const appliesTo = e.target.checked
                      ? [...ruleDraft.appliesTo, target]
                      : ruleDraft.appliesTo.filter((item) => item !== target);
                    setRuleDraft({ ...ruleDraft, appliesTo });
                  }}
                />
                {target.replace('_', ' ')}
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean(ruleDraft.isDefault)} onChange={(e) => setRuleDraft({ ...ruleDraft, isDefault: e.target.checked })} />
              Default rule
            </label>
          </div>
          <Button type="button" disabled={ruleDraft.appliesTo.length === 0} isLoading={loading} loadingLabel="Saving…" onClick={saveRule}>Save tax rule</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Category name" value={categoryDraft.name} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} />
            <Input placeholder="Description" value={categoryDraft.description} onChange={(e) => setCategoryDraft({ ...categoryDraft, description: e.target.value })} />
            <Select className="h-10 rounded-md border border-input bg-background px-3" value={categoryDraft.defaultTaxRuleId} onChange={(e) => setCategoryDraft({ ...categoryDraft, defaultTaxRuleId: e.target.value })}>
              <option value="">Use default item rule</option>
              {rules.map((rule) => (
                <option key={rule.id} value={rule.id}>{rule.taxName}</option>
              ))}
            </Select>
          </div>
          <Button type="button" isLoading={loading} loadingLabel="Saving…" onClick={saveCategory}>Save category</Button>
          <div className="grid gap-2 md:grid-cols-2">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border p-3">
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-muted-foreground">{category.description || 'No description'}</p>
                <p className="text-xs text-muted-foreground">
                  Default rule: {rules.find((rule) => rule.id === category.defaultTaxRuleId)?.taxName ?? 'Tenant default'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Taxable amount: {formatCurrency(summary?.taxableAmount ?? '0.00')}</p>
          <p>Tax collected: {formatCurrency(summary?.taxCollected ?? '0.00')}</p>
          <p>Tax lines: {summary?.lineCount ?? 0}</p>
          <div className="grid gap-2 md:grid-cols-3">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-lg border p-3">
                <p className="font-medium">{rule.taxName}</p>
                <p className="text-muted-foreground">{taxTypeLabel(rule.taxType)} {Number(rule.taxRate).toFixed(2)}% · {rule.priceMode}</p>
                <p className="text-muted-foreground">{rule.country}{rule.region ? `-${rule.region}` : ''}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      </div>
  );
}
