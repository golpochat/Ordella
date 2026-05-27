import { DataLakePanel } from '@/components/data-lake/data-lake-panel';
import {
  getDataLakeDashboard,
  listDataLakeExports,
  listDataLakeSchemas,
  listPipelineRuns,
} from '@/lib/api/admin/data-lake';
import { createServerApiClient } from '@/lib/api/server';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

export default async function DataLakePage() {
  const api = createServerApiClient();
  let error: string | null = null;
  let dashboard: Awaited<ReturnType<typeof getDataLakeDashboard>> | null = null;
  let schemas: Awaited<ReturnType<typeof listDataLakeSchemas>> = [];
  let pipelineRuns: Awaited<ReturnType<typeof listPipelineRuns>> = [];
  let exports: Awaited<ReturnType<typeof listDataLakeExports>> = [];

  try {
    [dashboard, schemas, pipelineRuns, exports] = await Promise.all([
      getDataLakeDashboard(api),
      listDataLakeSchemas(api),
      listPipelineRuns(api),
      listDataLakeExports(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Lake & ETL"
        description="Enterprise data zones, ingestion pipelines, star-schema warehouse, feature store, governance, and BI exports — tenant-isolated."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <DataLakePanel dashboard={dashboard} schemas={schemas} pipelineRuns={pipelineRuns} exports={exports} />
    </div>
  );
}
