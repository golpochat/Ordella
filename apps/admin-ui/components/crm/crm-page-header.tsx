'use client';

import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { useTranslation } from '@/components/ui/admin-i18n';
import { CRM_SUBNAV } from '@/lib/navigation';

export function CrmPageHeader() {
  const { t } = useTranslation();
  return (
    <PageHeader
      title={t('crm.title')}
      description={t('crm.description')}
      tabs={<SubNav variant="embedded" items={CRM_SUBNAV} />}
    />
  );
}
