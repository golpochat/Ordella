import { ComplianceSuitePanel } from '@/components/compliance-suite/compliance-suite-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import {
  fetchComplianceDashboard,
  listComplianceEvidence,
  listComplianceFrameworks,
  listCompliancePolicies,
  listComplianceRisks,
  type ComplianceDashboard,
  type ComplianceEvidence,
  type ComplianceFramework,
  type CompliancePolicy,
  type ComplianceRisk,
} from '@/lib/api/admin/compliance-suite';
import { createServerApiClient } from '@/lib/api/server';
import { getErrorMessage } from '@/lib/utils';

export default async function ComplianceSuitePage() {
  const api = createServerApiClient();
  let dashboard: ComplianceDashboard | null = null;
  let frameworks: ComplianceFramework[] = [];
  let risks: ComplianceRisk[] = [];
  let policies: CompliancePolicy[] = [];
  let evidence: ComplianceEvidence[] = [];
  let error: string | null = null;

  try {
    [dashboard, frameworks, risks, policies, evidence] = await Promise.all([
      fetchComplianceDashboard(api),
      listComplianceFrameworks(api),
      listComplianceRisks(api),
      listCompliancePolicies(api),
      listComplianceEvidence(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Compliance Suite"
        description="Retail OS certification, enterprise compliance, audit center, and security governance."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <ComplianceSuitePanel
        dashboard={dashboard}
        frameworks={frameworks}
        risks={risks}
        policies={policies}
        evidence={evidence}
      />
    </>
  );
}
