'use client';

import { useRouter } from 'next/navigation';
import type { Promotion } from '@shared-utils';
import { Button } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { activatePromotion, deactivatePromotion, duplicatePromotion } from '@/lib/api/admin/promotions';

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

  async function duplicate() {
    const api = createBrowserApiClient();
    await duplicatePromotion(api, promotion.id);
    router.refresh();
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={duplicate}>
        Duplicate
      </Button>
      <Button variant="secondary" size="sm" onClick={toggle}>
        {promotion.isActive ? 'Disable' : 'Activate'}
      </Button>
    </>
  );
}
