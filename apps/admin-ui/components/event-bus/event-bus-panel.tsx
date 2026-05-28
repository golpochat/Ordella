'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { PanelEmpty } from '@/components/ui/admin-empty-state';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  getEventById,
  getEventStream,
  listEventDeadLetters,
  replayEvents,
  type EventBusDashboard,
  type EventDeadLetter,
  type EventRecord,
  type EventTopic,
} from '@/lib/api/admin/event-bus';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

type EventBusPanelProps = {
  dashboard: EventBusDashboard | null;
  topics: EventTopic[];
  initialStream: EventRecord[];
  deadLetters: EventDeadLetter[];
};

export function EventBusPanel({ dashboard, topics, initialStream, deadLetters: initialDeadLetters }: EventBusPanelProps) {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useAdminToast();
  const api = useMemo(() => createBrowserApiClient(), []);
  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.topicKey ?? 'orders');
  const [stream, setStream] = useState(initialStream);
  const [deadLetters, setDeadLetters] = useState(initialDeadLetters);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(initialStream[0] ?? null);
  const [fromSequence, setFromSequence] = useState('');
  const [toSequence, setToSequence] = useState('');

  async function loadStream(topicKey = selectedTopic) {
    try {
      const result = await getEventStream(api, topicKey);
      setStream(result.events);
      setSelectedEvent(result.events[0] ?? null);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function inspectEvent(eventId: string) {
    try {
      const event = await getEventById(api, eventId);
      setSelectedEvent(event);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function runReplay() {
    try {
      const result = await replayEvents(api, {
        topicKey: selectedTopic,
        fromSequence: fromSequence || undefined,
        toSequence: toSequence || undefined,
      });
      toastInfo(`Replayed ${result.replayed} consumer deliveries across ${result.eventCount} events.`);
      setDeadLetters(await listEventDeadLetters(api, selectedTopic));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={4}>
        <Metric title="Topics" value={dashboard?.topicCount ?? topics.length} />
        <Metric title="Events (1h)" value={dashboard?.eventsLastHour ?? 0} />
        <Metric title="Throughput / min" value={dashboard?.throughputPerMinute ?? 0} />
        <Metric title="Open DLQ" value={dashboard?.openDeadLetters ?? deadLetters.length} />
      </MetricGrid>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className={`w-full rounded-md border p-3 text-left text-sm ${topic.topicKey === selectedTopic ? 'border-primary bg-muted' : 'hover:bg-muted'}`}
                onClick={() => {
                  setSelectedTopic(topic.topicKey);
                  void loadStream(topic.topicKey);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{topic.displayName}</span>
                  <Tag variant={topic.isActive ? 'neutral' : 'outline'}><TagLabel>{topic.isActive ? 'Active' : 'Disabled'}</TagLabel></Tag>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{topic.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{topic.partitionCount} partitions · {topic.retentionDays} day retention</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event stream · {selectedTopic}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Sequence</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Producer</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {stream.map((event) => (
                  <TableRow key={event.id} className="cursor-pointer" onClick={() => void inspectEvent(event.eventId)}>
                    <TableCell>{event.sequenceNumber}</TableCell>
                    <TableCell>{event.eventType}</TableCell>
                    <TableCell>{event.producer}</TableCell>
                    <TableCell>{formatDate(event.occurredAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!stream.length ? (
              <PanelEmpty title="No events in this stream" description="Published events will appear in the live stream." />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Event detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {selectedEvent ? (
              <>
                <p>Event ID: {selectedEvent.eventId}</p>
                <p>Partition: {selectedEvent.partitionKey}</p>
                <p>Schema version: {selectedEvent.schemaVersion}</p>
                <pre className="max-h-64 overflow-auto rounded-md border p-3 text-xs">{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
              </>
            ) : (
              <p className="text-muted-foreground">Select an event to inspect payload and metadata.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Replay & consumer lag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="From sequence" value={fromSequence} onChange={(event) => setFromSequence(event.target.value)} />
              <Input placeholder="To sequence" value={toSequence} onChange={(event) => setToSequence(event.target.value)} />
            </div>
            <Button type="button" onClick={() => void runReplay()}>Replay events</Button>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Consumer</TableHead>
                  <TableHead>Lag</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {(dashboard?.consumerLag ?? []).filter((row) => row.topicKey === selectedTopic).map((row) => (
                  <TableRow key={row.subscriptionId}>
                    <TableCell>
                      <p className="font-medium">{row.consumerGroup}</p>
                      <p className="text-xs text-muted-foreground">{row.consumerType}</p>
                    </TableCell>
                    <TableCell><Tag variant={row.lag > 100 ? 'error' : 'neutral'}><TagLabel>{row.lag}</TagLabel></Tag></TableCell>
                    <TableCell>{row.processedCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dead-letter queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {deadLetters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell>{letter.eventId}</TableCell>
                  <TableCell>{letter.attempts}</TableCell>
                  <TableCell>{letter.errorMessage}</TableCell>
                  <TableCell>{formatDate(letter.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!deadLetters.length ? (
            <PanelEmpty title="No dead-letter events" description="Failed deliveries awaiting replay will appear here." />
          ) : null}
        </CardContent>
      </Card>
    </Stack>
  );
}

