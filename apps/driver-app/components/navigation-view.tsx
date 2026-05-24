'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { formatAddress } from '@/lib/api';
import { getPickupAddress, getPickupName } from '@/lib/config';
import { appleMapsDirectionsUrl, googleMapsDirectionsUrl } from '@/lib/maps';
import { getActiveTaskId } from '@/lib/session';
import { loadTaskDetails } from '@/stores/tasks-store';
import { useTasksStore } from '@/stores/tasks-store';

export function NavigationView() {
  const searchParams = useSearchParams();
  const tasks = useTasksStore((s) => s.tasks);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [routeLabel, setRouteLabel] = useState('');

  useEffect(() => {
    const fromQuery = searchParams.get('taskId');
    const fromStorage = getActiveTaskId();
    const resolved = fromQuery ?? fromStorage ?? tasks.find((t) => t.status === 'en_route')?.id ?? tasks[0]?.id ?? null;
    setTaskId(resolved);
  }, [searchParams, tasks]);

  useEffect(() => {
    if (!taskId) return;
    void loadTaskDetails(taskId)
      .then((task) => {
        const pickupAddr = formatAddress(task.pickup) || getPickupAddress();
        const dropoffAddr = formatAddress(task.dropoff) || 'Delivery address';
        setRouteLabel(`${pickupAddr} → ${dropoffAddr}`);
      })
      .catch(() => setRouteLabel(''));
  }, [taskId]);

  const mapLinks = useMemo(() => {
    const pickup = {
      label: getPickupName(),
      address: getPickupAddress(),
    };
    const dropoff = {
      label: 'Delivery',
      address: routeLabel.split(' → ')[1] ?? '',
    };
    return {
      google: googleMapsDirectionsUrl(pickup, dropoff),
      apple: appleMapsDirectionsUrl(pickup, dropoff),
    };
  }, [routeLabel]);

  const activeTask = tasks.find((t) => t.id === taskId);

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Navigation</h1>
        <p className="text-sm text-muted-foreground">Pickup to dropoff directions</p>
      </div>

      {!taskId ? (
        <p className="text-sm text-muted-foreground">Select a task from your list to navigate.</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Route</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium">Pickup → Dropoff</p>
            <p className="text-muted-foreground">{routeLabel || 'Loading route…'}</p>
            {activeTask ? (
              <p className="text-muted-foreground">Status: {activeTask.status}</p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Button asChild>
                <a href={mapLinks.google} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={mapLinks.apple} target="_blank" rel="noopener noreferrer">
                  Open in Apple Maps
                </a>
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/task/${taskId}`}>View task details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
