'use client';

import { Logo } from '@shared-ui';
import { getLocationName } from '@/lib/config';
import type { FdsLocalSettings } from '@/lib/fds-settings';
import { FdsLocationSwitcher } from '@/components/fds-location-switcher';
import { FdsSettingsModal } from '@/components/fds-settings-modal';

type FdsHeaderProps = {
  connected: boolean;
  lastSync: Date | null;
  settings: FdsLocalSettings;
  onSettingsChange: (settings: FdsLocalSettings) => void;
  onRefresh: () => void;
};

export function FdsHeader({
  connected,
  lastSync,
  settings,
  onSettingsChange,
  onRefresh,
}: FdsHeaderProps) {
  const modeLabel =
    settings.fulfillmentModeFilter === 'all'
      ? 'All modes'
      : settings.fulfillmentModeFilter.charAt(0).toUpperCase() +
        settings.fulfillmentModeFilter.slice(1).replace('_', ' ');

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <Logo variant="mark" size="md" color="auto" />
        <div>
          <p className="text-sm font-semibold leading-tight">Fulfillment display</p>
          <p className="text-xs text-muted-foreground">
            {getLocationName()} · {modeLabel}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <FdsLocationSwitcher />
        <span
          className={
            connected
              ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800'
              : 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900'
          }
        >
          {connected ? 'Live' : 'Polling'}
        </span>
        {lastSync ? (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Updated {lastSync.toLocaleTimeString()}
          </span>
        ) : null}
        <button
          type="button"
          className="text-xs text-primary hover:underline"
          onClick={onRefresh}
        >
          Refresh
        </button>
        <FdsSettingsModal settings={settings} onChange={onSettingsChange} />
      </div>
    </header>
  );
}
