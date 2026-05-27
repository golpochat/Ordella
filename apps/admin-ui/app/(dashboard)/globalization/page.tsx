import { GlobalizationPanel } from '@/components/globalization/globalization-panel';
import {
  getGlobalizationDashboard,
  getGlobalizationSettings,
  getReportingDashboard,
  listComplianceProfiles,
  listCountryPrices,
  listFxRates,
  listTaxExemptions,
} from '@/lib/api/admin/globalization';
import { createServerApiClient } from '@/lib/api/server';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

export default async function GlobalizationPage() {
  const api = createServerApiClient();
  let error: string | null = null;
  let dashboard: Awaited<ReturnType<typeof getGlobalizationDashboard>> | null = null;
  let settingsBundle: Awaited<ReturnType<typeof getGlobalizationSettings>> | null = null;
  let fxRates: Awaited<ReturnType<typeof listFxRates>> = [];
  let prices: Awaited<ReturnType<typeof listCountryPrices>> = [];
  let exemptions: Awaited<ReturnType<typeof listTaxExemptions>> = [];
  let compliance: Awaited<ReturnType<typeof listComplianceProfiles>> = [];
  let reporting: Record<string, unknown> | null = null;

  try {
    [dashboard, settingsBundle, fxRates, prices, exemptions, compliance, reporting] = await Promise.all([
      getGlobalizationDashboard(api),
      getGlobalizationSettings(api),
      listFxRates(api),
      listCountryPrices(api),
      listTaxExemptions(api),
      listComplianceProfiles(api),
      getReportingDashboard(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Globalization"
        description="Multi-currency, tax, localization, country catalog and delivery rules, promotions, reporting, and compliance — tenant-scoped."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <GlobalizationPanel
        dashboard={dashboard}
        settingsBundle={settingsBundle}
        fxRates={fxRates}
        prices={prices}
        exemptions={exemptions}
        compliance={compliance}
        reporting={reporting}
      />
    </div>
  );
}
