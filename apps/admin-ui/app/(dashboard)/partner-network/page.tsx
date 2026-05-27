import { PartnerNetworkPanel } from '@/components/partner-network/partner-network-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { createServerApiClient } from '@/lib/api/server';
import { getErrorMessage } from '@/lib/utils';
import { listMarketplaceCategories, listMarketplaceItems, listPartnerApplications, type PartnerApplication, type PartnerMarketplaceCategory, type PartnerMarketplaceItem } from '@/lib/api/admin/partner-network';

export default async function PartnerNetworkPage() {
  const api = createServerApiClient();
  let applications: PartnerApplication[] = [];
  let categories: PartnerMarketplaceCategory[] = [];
  let items: PartnerMarketplaceItem[] = [];
  let error: string | null = null;

  try {
    [applications, categories, items] = await Promise.all([
      listPartnerApplications(api),
      listMarketplaceCategories(api),
      listMarketplaceItems(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Partner Network"
        description="Partner onboarding, marketplace expansion, commissions, and reporting."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {applications && categories && items ? (
        <PartnerNetworkPanel initialApplications={applications} initialCategories={categories} initialItems={items} />
      ) : null}
    </>
  );
}

