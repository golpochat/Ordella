import { createServerApiClient } from '@/lib/api/server';
import { listApiKeys, listWebhookLogs, listWebhooks } from '@/lib/api/admin/developer';
import { ApiKeysPanel } from '@/components/developer/api-keys-panel';
import { DeveloperDocsPanel } from '@/components/developer/developer-docs-panel';
import { WebhookLogsTable } from '@/components/developer/webhook-logs-table';
import { WebhooksPanel } from '@/components/developer/webhooks-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

export default async function DeveloperPage() {
  const api = createServerApiClient();
  let apiKeys: Awaited<ReturnType<typeof listApiKeys>> = [];
  let webhooks: Awaited<ReturnType<typeof listWebhooks>> = [];
  let webhookLogs: Awaited<ReturnType<typeof listWebhookLogs>> = [];
  let error: string | null = null;

  try {
    [apiKeys, webhooks, webhookLogs] = await Promise.all([
      listApiKeys(api),
      listWebhooks(api),
      listWebhookLogs(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Developer / API Access"
        description="Manage API keys, webhooks, documentation, and integration logs"
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <div className="space-y-6">
        <ApiKeysPanel initialKeys={apiKeys} />
        <WebhooksPanel initialWebhooks={webhooks} />
        <WebhookLogsTable logs={webhookLogs} />
        <DeveloperDocsPanel />
      </div>
    </>
  );
}
