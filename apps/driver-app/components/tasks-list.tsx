'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { useDeliverySocket } from '@/hooks/use-delivery-socket';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { formatAddress } from '@/lib/api';
import { statusLabel, TASK_FILTER_TABS, type TaskFilterTab } from '@/lib/delivery-status';
import { useTasksStore } from '@/stores/tasks-store';

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'delivered') return 'default';
  if (status === 'failed' || status === 'cancelled') return 'destructive';
  if (status === 'en_route') return 'secondary';
  return 'outline';
}

export function TasksList() {
  const { formatDateTime } = useTenantSettings();
  const filter = useTasksStore((s) => s.filter);
  const setFilter = useTasksStore((s) => s.setFilter);
  const loading = useTasksStore((s) => s.loading);
  const error = useTasksStore((s) => s.error);
  const loadTasks = useTasksStore((s) => s.loadTasks);
  const tasks = useTasksStore((s) => s.getFilteredTasks());

  useDeliverySocket();

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground">Assigned deliveries for your shift</p>
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as TaskFilterTab)}
      >
        <TabsList className="w-full flex-wrap h-auto">
          {TASK_FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter} className="mt-4 space-y-3">
          {loading ? <p className="text-sm text-muted-foreground">Loading tasks…</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!loading && !error && tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks in this filter.</p>
          ) : null}

          {tasks.map((task) => {
            const meta = task.metadata as Record<string, unknown>;
            const dropoff = (meta.dropoff ?? meta.delivery) as Record<string, string> | undefined;
            const address = dropoff ? formatAddress(dropoff) : 'Address pending';

            return (
              <Link key={task.id} href={`/task/${task.id}`}>
                <Card className="transition-colors hover:bg-accent/40">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">Order {task.orderId.slice(0, 8)}</CardTitle>
                    <Badge variant={statusVariant(task.status)}>{statusLabel(task.status)}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm text-muted-foreground">
                    <p>{address}</p>
                    {task.eta ? <p>ETA: {formatDateTime(task.eta)}</p> : null}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
