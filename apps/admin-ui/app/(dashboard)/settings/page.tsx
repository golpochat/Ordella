import { PageHeader } from '@shared-ui';
import { SettingsForms } from '@/components/settings/settings-forms';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Tenant configuration, localization, and integrations"
      />
      <SettingsForms />
    </>
  );
}
