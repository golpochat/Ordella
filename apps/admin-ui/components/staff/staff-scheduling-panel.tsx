'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { getLaborForecast, getStaffRoster, upsertStaffShift, type LaborForecast, type StaffRoster, type StaffShift } from '@/lib/api/admin/staff-scheduling';
import type { StaffMember } from '@/lib/api/staff';
import type { LocationListItem } from '@/lib/api/locations';
import { formatMoney, getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

type StaffSchedulingPanelProps = {
  initialRoster: StaffRoster;
  initialForecast: LaborForecast;
  staff: StaffMember[];
  locations: LocationListItem[];
};

const roles: StaffShift['role'][] = ['cashier', 'picker', 'driver', 'manager'];

export function StaffSchedulingPanel({ initialRoster, initialForecast, staff, locations }: StaffSchedulingPanelProps) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = createBrowserApiClient();
  const [roster, setRoster] = useState(initialRoster);
  const [forecast, setForecast] = useState(initialForecast);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [selectedTemplate, setSelectedTemplate] = useState(initialRoster.templates[0]?.name ?? 'morning');
  const [form, setForm] = useState({
    employeeId: staff[0]?.id ?? '',
    locationId: locations[0]?.id ?? '',
    role: 'cashier' as StaffShift['role'],
    date: new Date().toISOString().slice(0, 10),
    hourlyRate: '15',
  });
    const days = useMemo(() => {

    const from = new Date(roster.from);
    const count = view === 'month' ? 31 : 7;
    return Array.from({ length: count }, (_, index) => {
      const day = new Date(from);
      day.setDate(from.getDate() + index);
      return day.toISOString().slice(0, 10);
    });
  }, [roster.from, view]);

  async function reload(nextView = view) {
    const params = { view: nextView, locationId: form.locationId || undefined };
    const [nextRoster, nextForecast] = await Promise.all([
      getStaffRoster(api, params),
      getLaborForecast(api, params),
    ]);
    setRoster(nextRoster);
    setForecast(nextForecast);
  }

  async function createShift(date: string) {
    const template = roster.templates.find((item) => item.name === selectedTemplate) ?? roster.templates[0];
    if (!form.employeeId || !form.locationId || !template) return;
    try {
      await upsertStaffShift(api, {
        employeeId: form.employeeId,
        locationId: form.locationId,
        role: form.role,
        shiftStart: `${date}T${template.start}:00`,
        shiftEnd: `${date}T${template.end}:00`,
        breakRules: template.breakRules,
        hourlyRate: Number(form.hourlyRate || 0),
        templateName: template.name,
      });
      toastSuccess(`Created ${template.label} shift.`);
      await reload();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function applyView(nextView: 'week' | 'month') {
    setView(nextView);
    await reload(nextView);
  }

  const locationName = new Map(locations.map((location) => [location.id, location.name]));

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={4}>
        <Metric label="Labor cost" value={formatMoney(roster.laborCost.total)} />
        <Metric label="Overtime hours" value={roster.laborCost.overtimeHours} />
        <Metric label="Conflicts" value={roster.conflicts.length} />
        <Metric label="Scheduled shifts" value={roster.shifts.length} />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle>Schedule controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })}>
              {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </Select>
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })}>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </Select>
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as StaffShift['role'] })}>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </Select>
            <Input type="number" min={0} value={form.hourlyRate} onChange={(event) => setForm({ ...form, hourlyRate: event.target.value })} />
            <div className="flex gap-2">
              <Button type="button" variant={view === 'week' ? 'brand' : 'outline'} onClick={() => void applyView('week')}>Week</Button>
              <Button type="button" variant={view === 'month' ? 'brand' : 'outline'} onClick={() => void applyView('month')}>Month</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {roster.templates.map((template) => (
              <Button
                key={template.name}
                type="button"
                variant={selectedTemplate === template.name ? 'brand' : 'outline'}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', template.name)}
                onClick={() => setSelectedTemplate(template.name)}
              >
                {template.label} {template.start}-{template.end}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roster board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-7">
            {days.map((day) => (
              <div
                key={day}
                className="min-h-52 rounded-md border p-3"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const template = event.dataTransfer.getData('text/plain');
                  setSelectedTemplate(template || selectedTemplate);
                  void createShift(day);
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{day}</p>
                  <Button type="button" size="sm" variant="ghost" onClick={() => void createShift(day)}>Add</Button>
                </div>
                <div className="space-y-2">
                  {roster.shifts.filter((shift) => shift.shiftStart.slice(0, 10) === day).map((shift) => (
                    <div key={shift.id} className="rounded-md bg-muted p-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">{shift.employeeName}</span>
                        <Tag variant={shift.conflicts?.length ? 'error' : 'neutral'}><TagLabel>{shift.role}</TagLabel></Tag>
                      </div>
                      <p>{timeLabel(shift.shiftStart)}-{timeLabel(shift.shiftEnd)}</p>
                      <p className="text-muted-foreground">{locationName.get(shift.locationId) ?? shift.locationId}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Labor forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Hour</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {forecast.hourly.filter((row) => row.requiredStaff > 0 || row.scheduledStaff > 0).map((row) => (
                  <TableRow key={row.hour}>
                    <TableCell>{row.hour}:00</TableCell>
                    <TableCell>{row.forecastedOrders}</TableCell>
                    <TableCell>{row.requiredStaff}</TableCell>
                    <TableCell>{row.scheduledStaff}</TableCell>
                    <TableCell>
                      <Tag variant={row.status === 'balanced' ? 'neutral' : 'error'}><TagLabel>{row.status}</TagLabel></Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor cost by day</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {roster.laborCost.byDay.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{formatMoney(row.cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}


function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
