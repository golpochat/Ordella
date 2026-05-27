import { EventBusPanel } from '@/components/event-bus/event-bus-panel';
import {
  getEventBusDashboard,
  getEventStream,
  listEventDeadLetters,
  listEventTopics,
} from '@/lib/api/admin/event-bus';
import { createServerApiClient } from '@/lib/api/server';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

export default async function EventBusPage() {
  const api = createServerApiClient();
  let error: string | null = null;
  let dashboard: Awaited<ReturnType<typeof getEventBusDashboard>> | null = null;
  let topics: Awaited<ReturnType<typeof listEventTopics>> = [];
  let initialStream: Awaited<ReturnType<typeof getEventStream>>['events'] = [];
  let deadLetters: Awaited<ReturnType<typeof listEventDeadLetters>> = [];

  try {
    [dashboard, topics, deadLetters] = await Promise.all([
      getEventBusDashboard(api),
      listEventTopics(api),
      listEventDeadLetters(api),
    ]);
    if (topics[0]) {
      initialStream = (await getEventStream(api, topics[0].topicKey)).events;
    }
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Bus"
        description="Monitor real-time topics, inspect append-only event streams, replay events, and track consumer lag and throughput."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <EventBusPanel dashboard={dashboard} topics={topics} initialStream={initialStream} deadLetters={deadLetters} />
    </div>
  );
}
