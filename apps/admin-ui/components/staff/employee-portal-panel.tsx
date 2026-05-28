'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { clockIn, clockOut, requestShiftSwap, requestTimeOff, type EmployeeSchedulePortal } from '@/lib/api/admin/staff-scheduling';
import { getErrorMessage } from '@/lib/utils';

export function EmployeePortalPanel({ initialPortal }: { initialPortal: EmployeeSchedulePortal }) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = createBrowserApiClient();
  const [portal] = useState(initialPortal);
  const [timeOff, setTimeOff] = useState({ startAt: '', endAt: '', reason: '' });
  const [swapNote, setSwapNote] = useState('');
    async function action(label: string, run: () => Promise<unknown>) {
    try {
      await run();
      toastSuccess(label);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <Card>
        <CardHeader>
          <CardTitle>Assigned shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Shift</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {portal.shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    <p>{new Date(shift.shiftStart).toLocaleString()} - {new Date(shift.shiftEnd).toLocaleTimeString()}</p>
                  </TableCell>
                  <TableCell>{shift.role}</TableCell>
                  <TableCell><Tag variant="neutral"><TagLabel>{shift.status}</TagLabel></Tag></TableCell>
                  <TableCell className="space-x-2">
                    <Button type="button" size="sm" onClick={() => void action('Clocked in.', () => clockIn(api, shift.id))}>Clock in</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void action('Clocked out.', () => clockOut(api, shift.id))}>Clock out</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => void action('Swap requested.', () => requestShiftSwap(api, { shiftId: shift.id, note: swapNote }))}>Request swap</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Input className="mt-3" placeholder="Optional swap note" value={swapNote} onChange={(event) => setSwapNote(event.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request time off</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input type="datetime-local" value={timeOff.startAt} onChange={(event) => setTimeOff({ ...timeOff, startAt: event.target.value })} />
            <Input type="datetime-local" value={timeOff.endAt} onChange={(event) => setTimeOff({ ...timeOff, endAt: event.target.value })} />
            <Input placeholder="Reason" value={timeOff.reason} onChange={(event) => setTimeOff({ ...timeOff, reason: event.target.value })} />
          </div>
          <Button type="button" onClick={() => void action('Time off requested.', () => requestTimeOff(api, timeOff))}>
            Submit time off
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Time off requests</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {portal.timeOff.map((request, index) => (
              <div key={String(request.id ?? index)} className="rounded-md border p-3">
                <p>{String(request.startAt ?? '')} - {String(request.endAt ?? '')}</p>
                <p className="text-muted-foreground">{String(request.status ?? 'pending')}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Swap requests</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {portal.swaps.map((request, index) => (
              <div key={String(request.id ?? index)} className="rounded-md border p-3">
                <p>Shift {String(request.shiftId ?? '')}</p>
                <p className="text-muted-foreground">{String(request.status ?? 'pending')}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}
