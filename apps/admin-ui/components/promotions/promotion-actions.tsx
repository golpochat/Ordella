'use client';

import { useRouter } from 'next/navigation';
import type { Promotion } from '@shared-utils';
import { Button } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { activatePromotion, deactivatePromotion } from '@/lib/api/admin/promotions';

export function PromotionActions({ promotion }: { promotion: Promotion }) {
  const router = useRouter();

  async function toggle() {
    const api = createBrowserApiClient();
    if (promotion.isActive) {
      await deactivatePromotion(api, promotion.id);
    } else {
      await activatePromotion(api, promotion.id);
    }
    router.refresh();
  }

  return (
    <Button variant="secondary" size="sm" onClick={toggle}>
      {promotion.isActive ? 'Deactivate' : 'Activate'}
    </Button>
  );
}
