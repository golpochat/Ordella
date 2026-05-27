import { CloudPlatformPanel } from '@/components/cloud-platform/cloud-platform-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import {
  fetchCloudDashboard,
  getCloudResidency,
  listCloudDeployments,
  listCloudEdgeNodes,
  listCloudFailover,
  listCloudMetrics,
  listCloudRegions,
  type CloudDashboard,
  type CloudDeployment,
  type CloudEdgeNode,
  type CloudFailoverRule,
  type CloudRegion,
  type CloudRegionMetrics,
  type CloudResidencyPolicy,
} from '@/lib/api/admin/cloud-platform';
import { createServerApiClient } from '@/lib/api/server';
import { getErrorMessage } from '@/lib/utils';

export default async function CloudPlatformPage() {
  const api = createServerApiClient();
  let dashboard: CloudDashboard | null = null;
  let regions: CloudRegion[] = [];
  let residency: CloudResidencyPolicy | null = null;
  let failoverRules: CloudFailoverRule[] = [];
  let metrics: CloudRegionMetrics[] = [];
  let edgeNodes: CloudEdgeNode[] = [];
  let deployments: CloudDeployment[] = [];
  let error: string | null = null;

  try {
    [dashboard, regions, residency, failoverRules, metrics, edgeNodes, deployments] = await Promise.all([
      fetchCloudDashboard(api),
      listCloudRegions(api),
      getCloudResidency(api),
      listCloudFailover(api),
      listCloudMetrics(api),
      listCloudEdgeNodes(api),
      listCloudDeployments(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Cloud Platform"
        description="SaaS regions, multi-cloud, edge nodes, residency, routing, and zero-downtime deployments."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <CloudPlatformPanel
        dashboard={dashboard}
        regions={regions}
        residency={residency}
        failoverRules={failoverRules}
        metrics={metrics}
        edgeNodes={edgeNodes}
        deployments={deployments}
      />
    </>
  );
}
