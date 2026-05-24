'use client';

import { useEffect } from 'react';
import { saveMarketingAttribution } from '@/lib/marketing-attribution';

type MarketingAttributionCaptureProps = {
  plan?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
};

export function MarketingAttributionCapture({
  plan,
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
}: MarketingAttributionCaptureProps) {
  useEffect(() => {
    if (!plan && !utmSource && !utmMedium && !utmCampaign && !utmContent) {
      return;
    }

    saveMarketingAttribution({
      plan,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
    });
  }, [plan, utmSource, utmMedium, utmCampaign, utmContent]);

  return null;
}
