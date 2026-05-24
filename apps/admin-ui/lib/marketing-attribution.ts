export const MARKETING_ATTRIBUTION_KEY = 'ordella_marketing_attribution';

export type MarketingAttribution = {
  plan?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  capturedAt: string;
};

export function saveMarketingAttribution(data: Omit<MarketingAttribution, 'capturedAt'>): void {
  if (typeof window === 'undefined') return;

  const payload: MarketingAttribution = {
    ...data,
    capturedAt: new Date().toISOString(),
  };

  sessionStorage.setItem(MARKETING_ATTRIBUTION_KEY, JSON.stringify(payload));
}

export function readMarketingAttribution(): MarketingAttribution | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(MARKETING_ATTRIBUTION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MarketingAttribution;
  } catch {
    return null;
  }
}
