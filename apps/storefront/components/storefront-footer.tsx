'use client';

import { Logo, useTheme } from '@shared-ui';
import { getBrandName, getBusinessAddress, getOpeningHours } from '@/lib/config';

export function StorefrontFooter() {
  const theme = useTheme();
  const logoUrl = theme.assets?.logo ?? theme.logoUrl;
  const brandName = theme.name ?? getBrandName();

  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-[var(--storefront-container)] px-[var(--theme-spacing)] py-8 text-sm">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-[var(--storefront-radius)] bg-background object-contain p-1" />
          ) : (
            <Logo variant="mark" size="md" color="auto" />
          )}
          <p className="font-medium">{brandName}</p>
        </div>
        {getBusinessAddress() ? <p className="mt-2">{getBusinessAddress()}</p> : null}
        <p className="mt-2 opacity-80">Opening hours: {getOpeningHours()}</p>
      </div>
    </footer>
  );
}
