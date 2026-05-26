'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  updateRecommendationSettings,
  type RecommendationAnalytics,
  type RecommendationSettings,
  type SearchAnalytics,
} from '@/lib/api/admin/recommendations';
import { getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

type AiRecommendationsPanelProps = {
  analytics: RecommendationAnalytics | null;
  settings: RecommendationSettings | null;
  searchAnalytics: SearchAnalytics | null;
};

const recommendationTypes = [
  ['trending', 'Trending products'],
  ['frequently_bought_together', 'Frequently bought together'],
  ['recently_viewed', 'Recently viewed'],
  ['similar_products', 'Similar products'],
  ['category_based', 'Category based'],
] as const;

const weightFields = [
  ['trending', 'Trending weight'],
  ['frequentlyBoughtTogether', 'Frequently bought together weight'],
  ['recentlyViewed', 'Recently viewed weight'],
  ['similarProducts', 'Similar product weight'],
  ['categoryBased', 'Category relevance weight'],
  ['availability', 'Availability weight'],
] as const;

export function AiRecommendationsPanel({ analytics, settings: initialSettings, searchAnalytics }: AiRecommendationsPanelProps) {
  const { formatCurrency } = useTenantSettings();
  const [settings, setSettings] = useState<RecommendationSettings | null>(
    initialSettings ?? analytics?.settings ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const api = createBrowserApiClient();

  async function save(patch: Partial<RecommendationSettings>) {
    setSaving(true);
    setError(null);
    try {
      setSettings(await updateRecommendationSettings(api, patch));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  const cards = [
    { label: 'Impressions', value: analytics?.impressions ?? 0 },
    { label: 'Clicks', value: analytics?.clicks ?? 0 },
    { label: 'Add-to-cart rate', value: `${analytics?.addToCartRate ?? 0}%` },
    { label: 'Conversion rate', value: `${analytics?.conversionRate ?? 0}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommendation performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Revenue influenced</span>
              <span>{formatCurrency(analytics?.revenueInfluenced ?? '0.00')}</span>
            </div>
            <div className="flex justify-between">
              <span>AOV uplift</span>
              <span>{analytics?.aovUplift ?? '0.00'}%</span>
            </div>
            <div className="flex justify-between">
              <span>Conversion uplift</span>
              <span>{analytics?.conversionUplift ?? '0.00'}%</span>
            </div>
            <div className="border-t pt-3">
              <p className="font-medium">Top recommended items</p>
              {analytics?.topRecommendedItems.length ? (
                <div className="mt-2 space-y-2">
                  {analytics.topRecommendedItems.map((item) => (
                    <div key={item.itemId} className="flex justify-between text-muted-foreground">
                      <span>{item.name}</span>
                      <span>{item.events} events</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">No recommendation events yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Queries', searchAnalytics?.queries ?? 0],
                ['CTR', `${searchAnalytics?.clickThroughRate ?? 0}%`],
                ['Conversion', `${searchAnalytics?.conversionRate ?? 0}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border p-3">
                  <p className="text-muted-foreground">{label}</p>
                  <p className="text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="font-medium">Top searches</p>
              {searchAnalytics?.topQueries.length ? (
                <div className="mt-2 space-y-2">
                  {searchAnalytics.topQueries.map((item) => (
                    <div key={item.query} className="flex justify-between text-muted-foreground">
                      <span>{item.query}</span>
                      <span>{item.count} searches · {item.avgResults} avg results</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">No search queries recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings ? (
              <>
                {[
                  ['isEnabled', 'Enable recommendations'],
                  ['personalizationEnabled', 'Enable personalization'],
                  ['cartUpsellsEnabled', 'Enable cart upsells'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[key as keyof RecommendationSettings])}
                      onChange={(e) => void save({ [key]: e.target.checked } as Partial<RecommendationSettings>)}
                    />
                  </label>
                ))}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Max recommendations per section</label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={settings.maxRecommendations}
                    onChange={(e) => setSettings({ ...settings, maxRecommendations: Number(e.target.value) })}
                    onBlur={() => void save({ maxRecommendations: settings.maxRecommendations })}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recommendation types</p>
                  {recommendationTypes.map(([type, label]) => (
                    <label key={type} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={settings.enabledTypes.includes(type)}
                        onChange={(e) => {
                          const enabledTypes = e.target.checked
                            ? [...new Set([...settings.enabledTypes, type])]
                            : settings.enabledTypes.filter((item) => item !== type);
                          setSettings({ ...settings, enabledTypes });
                          void save({ enabledTypes });
                        }}
                      />
                    </label>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {weightFields.map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-sm font-medium">{label}</label>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        value={settings.rankingWeights[key] ?? 1}
                        onChange={(e) => setSettings({
                          ...settings,
                          rankingWeights: { ...settings.rankingWeights, [key]: Number(e.target.value) },
                        })}
                        onBlur={() => void save({ rankingWeights: settings.rankingWeights })}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Personalization rules</label>
                  <Input
                    value={String(settings.personalizationRules.strategy ?? 'recent + purchase history + CRM categories')}
                    onChange={(e) => setSettings({
                      ...settings,
                      personalizationRules: { ...settings.personalizationRules, strategy: e.target.value },
                    })}
                    onBlur={() => void save({ personalizationRules: settings.personalizationRules })}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Settings are not available yet.</p>
            )}
            {saving ? <p className="text-sm text-muted-foreground">Saving…</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Refresh metrics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
