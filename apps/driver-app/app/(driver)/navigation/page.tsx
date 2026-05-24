import { Suspense } from 'react';
import { NavigationView } from '@/components/navigation-view';

export default function NavigationPage() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Loading navigation…</p>}>
      <NavigationView />
    </Suspense>
  );
}
