import { PageHeader } from '@/components/ui/page-header';
import { SettingsForms } from '@/components/settings/settings-forms';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Tenant configuration and integrations" />
      <SettingsForms />
    </>
  );
}
