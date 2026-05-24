import { getBrandName, getBusinessAddress, getOpeningHours } from '@/lib/config';

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{getBrandName()}</p>
        {getBusinessAddress() ? <p className="mt-2">{getBusinessAddress()}</p> : null}
        <p className="mt-2">Opening hours: {getOpeningHours()}</p>
      </div>
    </footer>
  );
}
