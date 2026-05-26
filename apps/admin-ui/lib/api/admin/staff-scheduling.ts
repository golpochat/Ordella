import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export type ScheduleParams = {
  from?: string;
  to?: string;
  locationId?: string;
  view?: 'week' | 'month';
};

const shiftSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  scheduleId: z.string().uuid().nullable().optional(),
  employeeId: z.string().uuid(),
  employeeName: z.string().optional(),
  employeeEmail: z.string().nullable().optional(),
  locationId: z.string().uuid(),
  role: z.enum(['cashier', 'picker', 'driver', 'manager']),
  shiftStart: z.string(),
  shiftEnd: z.string(),
  breakRules: z.record(z.unknown()).default({}),
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']),
  hourlyRate: z.string(),
  templateName: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
  conflicts: z.array(z.record(z.unknown())).default([]).optional(),
});

const laborCostSchema = z.object({
  total: z.string(),
  overtimeHours: z.number(),
  byDay: z.array(z.object({ date: z.string(), cost: z.string() })),
});

const rosterSchema = z.object({
  view: z.string(),
  from: z.string(),
  to: z.string(),
  templates: z.array(z.object({
    name: z.string(),
    label: z.string(),
    start: z.string(),
    end: z.string(),
    breakRules: z.record(z.unknown()).default({}),
  })),
  shifts: z.array(shiftSchema),
  laborCost: laborCostSchema,
  roleCoverage: z.record(z.number()),
  conflicts: z.array(z.record(z.unknown())),
});

const laborForecastSchema = z.object({
  generatedAt: z.string(),
  hourly: z.array(z.object({
    hour: z.number(),
    forecastedOrders: z.number(),
    requiredStaff: z.number(),
    scheduledStaff: z.number(),
    status: z.enum(['understaffed', 'overstaffed', 'balanced']),
  })),
  laborCost: laborCostSchema,
});

const employeePortalSchema = z.object({
  shifts: z.array(shiftSchema),
  timeOff: z.array(z.record(z.unknown())),
  swaps: z.array(z.record(z.unknown())),
});

export type StaffShift = z.infer<typeof shiftSchema>;
export type StaffRoster = z.infer<typeof rosterSchema>;
export type LaborForecast = z.infer<typeof laborForecastSchema>;
export type EmployeeSchedulePortal = z.infer<typeof employeePortalSchema>;

export async function getStaffRoster(api: ApiClient, params?: ScheduleParams) {
  const data = await api.getData<unknown>('staff-scheduling/roster', { params });
  return rosterSchema.parse(data);
}

export async function upsertStaffShift(api: ApiClient, body: {
  id?: string;
  employeeId: string;
  locationId: string;
  role: StaffShift['role'];
  shiftStart: string;
  shiftEnd: string;
  breakRules?: Record<string, unknown>;
  status?: StaffShift['status'];
  hourlyRate?: number;
  templateName?: string;
}) {
  const data = await api.postData<unknown>('staff-scheduling/shifts/upsert', body);
  return shiftSchema.parse(data);
}

export async function getLaborForecast(api: ApiClient, params?: ScheduleParams) {
  const data = await api.getData<unknown>('staff-scheduling/labor-forecast', { params });
  return laborForecastSchema.parse(data);
}

export async function getEmployeeSchedulePortal(api: ApiClient, params?: ScheduleParams) {
  const data = await api.getData<unknown>('staff-scheduling/employee/portal', { params });
  return employeePortalSchema.parse(data);
}

export async function clockIn(api: ApiClient, shiftId: string) {
  return api.postData<unknown>('staff-scheduling/employee/clock-in', { shiftId });
}

export async function clockOut(api: ApiClient, shiftId: string) {
  return api.postData<unknown>('staff-scheduling/employee/clock-out', { shiftId });
}

export async function requestTimeOff(api: ApiClient, body: { startAt: string; endAt: string; reason?: string }) {
  return api.postData<unknown>('staff-scheduling/employee/time-off', body);
}

export async function requestShiftSwap(api: ApiClient, body: { shiftId: string; targetEmployeeId?: string; note?: string }) {
  return api.postData<unknown>('staff-scheduling/employee/swap', body);
}
