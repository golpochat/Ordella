import { Logo } from '@shared-ui';

export function KdsHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <Logo variant="full" size="sm" color="auto" />
        <span className="text-sm font-medium text-muted-foreground">Kitchen display</span>
      </div>
    </header>
  );
}
