import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { UserEntity } from '../../auth/entities';
import { DriverProfileEntity } from '../../deliveries/entities';
import { ForecastSnapshotEntity } from '../../forecast/entities';
import { WarehousePickTaskEntity } from '../../warehouse/entities';
import { ClockShiftDto, ShiftSwapRequestDto, StaffScheduleQueryDto, TimeOffRequestDto, UpsertStaffShiftDto } from '../dto';
import {
  StaffAttendanceLogEntity,
  StaffShiftEntity,
  StaffShiftRole,
  StaffShiftSwapRequestEntity,
  StaffTimeOffRequestEntity,
} from '../entities';

const SHIFT_TEMPLATES = [
  { name: 'morning', label: 'Morning', start: '08:00', end: '14:00', breakRules: { paidBreakMinutes: 15 } },
  { name: 'mid', label: 'Mid', start: '12:00', end: '18:00', breakRules: { unpaidBreakMinutes: 30 } },
  { name: 'evening', label: 'Evening', start: '16:00', end: '22:00', breakRules: { unpaidBreakMinutes: 30 } },
];

@Injectable()
export class StaffSchedulingService {
  constructor(
    @InjectRepository(StaffShiftEntity)
    private readonly shifts: Repository<StaffShiftEntity>,
    @InjectRepository(StaffAttendanceLogEntity)
    private readonly attendance: Repository<StaffAttendanceLogEntity>,
    @InjectRepository(StaffTimeOffRequestEntity)
    private readonly timeOff: Repository<StaffTimeOffRequestEntity>,
    @InjectRepository(StaffShiftSwapRequestEntity)
    private readonly swaps: Repository<StaffShiftSwapRequestEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(DriverProfileEntity)
    private readonly drivers: Repository<DriverProfileEntity>,
    @InjectRepository(WarehousePickTaskEntity)
    private readonly pickTasks: Repository<WarehousePickTaskEntity>,
    @InjectRepository(ForecastSnapshotEntity)
    private readonly forecasts: Repository<ForecastSnapshotEntity>,
  ) {}

  async roster(tenant: TenantContext, query: StaffScheduleQueryDto) {
    const range = this.resolveRange(query);
    const shifts = await this.listShifts(tenant.tenantId, range.from, range.to, query.locationId);
    const employees = await this.employeeMap(tenant.tenantId, shifts.map((shift) => shift.employeeId));
    const conflicts = await this.conflicts(tenant.tenantId, shifts);
    return {
      view: query.view ?? 'week',
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      templates: SHIFT_TEMPLATES,
      shifts: shifts.map((shift) => this.toShiftView(shift, employees.get(shift.employeeId), conflicts.get(shift.id) ?? [])),
      laborCost: this.laborCost(shifts),
      roleCoverage: this.roleCoverage(shifts),
      conflicts: [...conflicts.entries()].flatMap(([shiftId, rows]) => rows.map((conflict) => ({ shiftId, ...conflict }))),
    };
  }

  async upsertShift(tenant: TenantContext, dto: UpsertStaffShiftDto) {
    const employee = await this.users.findOne({ where: { tenantId: tenant.tenantId, id: dto.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');
    const shiftStart = new Date(dto.shiftStart);
    const shiftEnd = new Date(dto.shiftEnd);
    if (shiftEnd <= shiftStart) throw new BadRequestException('Shift end must be after shift start');
    const conflicts = await this.detectConflicts(tenant.tenantId, dto.employeeId, shiftStart, shiftEnd, dto.id);
    const entity = dto.id
      ? await this.requireShift(tenant.tenantId, dto.id)
      : this.shifts.create({ tenantId: tenant.tenantId });
    entity.scheduleId = dto.scheduleId ?? null;
    entity.employeeId = dto.employeeId;
    entity.locationId = dto.locationId;
    entity.role = dto.role;
    entity.shiftStart = shiftStart;
    entity.shiftEnd = shiftEnd;
    entity.breakRules = dto.breakRules ?? this.templateFor(dto.templateName)?.breakRules ?? {};
    entity.status = dto.status ?? entity.status ?? 'scheduled';
    entity.hourlyRate = String(dto.hourlyRate ?? Number(entity.hourlyRate ?? 0));
    entity.templateName = dto.templateName ?? null;
    entity.metadata = { ...(entity.metadata ?? {}), conflicts };
    return this.shifts.save(entity);
  }

  async attendanceLogs(tenant: TenantContext, query: StaffScheduleQueryDto) {
    const range = this.resolveRange(query);
    const logs = await this.attendance.find({
      where: {
        tenantId: tenant.tenantId,
        ...(query.locationId ? { locationId: query.locationId } : {}),
        clockInAt: MoreThan(range.from),
      },
      order: { clockInAt: 'DESC' },
      take: 200,
    });
    return logs;
  }

  async clockIn(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: ClockShiftDto) {
    const shift = await this.requireOwnShift(tenant.tenantId, user, dto.shiftId);
    const now = new Date();
    let log = await this.attendance.findOne({ where: { tenantId: tenant.tenantId, shiftId: shift.id, employeeId: shift.employeeId } });
    if (!log) {
      log = this.attendance.create({ tenantId: tenant.tenantId, shiftId: shift.id, employeeId: shift.employeeId, locationId: shift.locationId });
    }
    log.clockInAt = log.clockInAt ?? now;
    log.lateMinutes = Math.max(0, Math.round((log.clockInAt.getTime() - shift.shiftStart.getTime()) / 60000));
    shift.status = 'active';
    await this.shifts.save(shift);
    return this.attendance.save(log);
  }

  async clockOut(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: ClockShiftDto) {
    const shift = await this.requireOwnShift(tenant.tenantId, user, dto.shiftId);
    const log = await this.attendance.findOne({ where: { tenantId: tenant.tenantId, shiftId: shift.id, employeeId: shift.employeeId } });
    if (!log?.clockInAt) throw new BadRequestException('Clock in before clocking out');
    log.clockOutAt = new Date();
    log.earlyLeaveMinutes = Math.max(0, Math.round((shift.shiftEnd.getTime() - log.clockOutAt.getTime()) / 60000));
    shift.status = 'completed';
    await this.shifts.save(shift);
    return this.attendance.save(log);
  }

  async employeePortal(tenant: TenantContext, user: AuthenticatedUser | undefined, query: StaffScheduleQueryDto) {
    if (!user) throw new BadRequestException('User is required');
    const range = this.resolveRange(query);
    const [shifts, timeOff, swaps] = await Promise.all([
      this.listShifts(tenant.tenantId, range.from, range.to, undefined, user.id),
      this.timeOff.find({ where: { tenantId: tenant.tenantId, employeeId: user.id }, order: { createdAt: 'DESC' }, take: 20 }),
      this.swaps.find({ where: { tenantId: tenant.tenantId, requesterId: user.id }, order: { createdAt: 'DESC' }, take: 20 }),
    ]);
    return { shifts, timeOff, swaps };
  }

  async requestTimeOff(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: TimeOffRequestDto) {
    if (!user) throw new BadRequestException('User is required');
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (endAt <= startAt) throw new BadRequestException('End must be after start');
    return this.timeOff.save(this.timeOff.create({
      tenantId: tenant.tenantId,
      employeeId: user.id,
      startAt,
      endAt,
      reason: dto.reason?.trim() || null,
      status: 'pending',
    }));
  }

  async requestSwap(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: ShiftSwapRequestDto) {
    if (!user) throw new BadRequestException('User is required');
    const shift = await this.requireOwnShift(tenant.tenantId, user, dto.shiftId);
    return this.swaps.save(this.swaps.create({
      tenantId: tenant.tenantId,
      shiftId: shift.id,
      requesterId: user.id,
      targetEmployeeId: dto.targetEmployeeId ?? null,
      note: dto.note?.trim() || null,
      status: 'pending',
    }));
  }

  async availability(tenant: TenantContext, query: StaffScheduleQueryDto & { role?: StaffShiftRole }) {
    const range = this.resolveRange(query);
    const shifts = await this.listShifts(tenant.tenantId, range.from, range.to, query.locationId);
    const activeByRole = this.roleCoverage(shifts.filter((shift) => shift.status !== 'cancelled'));
    const [activeDrivers, activePickers] = await Promise.all([
      this.drivers.count({ where: { tenantId: tenant.tenantId, active: true } }),
      this.pickTasks
        .createQueryBuilder('task')
        .where('task.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('task.status IN (:...statuses)', { statuses: ['pending', 'picking'] })
        .getCount(),
    ]);
    return {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      scheduledByRole: activeByRole,
      deliveryRouting: { scheduledDrivers: activeByRole.driver ?? 0, activeDrivers },
      warehousePicking: { scheduledPickers: activeByRole.picker ?? 0, openPickTasks: activePickers },
      posOperations: { scheduledCashiers: activeByRole.cashier ?? 0 },
    };
  }

  async laborForecast(tenant: TenantContext, query: StaffScheduleQueryDto) {
    const range = this.resolveRange(query);
    const shifts = await this.listShifts(tenant.tenantId, range.from, range.to, query.locationId);
    const forecast = await this.forecasts.findOne({
      where: {
        tenantId: tenant.tenantId,
        forecastType: 'staffing',
        ...(query.locationId ? { locationId: query.locationId } : {}),
      },
      order: { generatedAt: 'DESC' },
    });
    const hourlyForecast = Array.isArray(forecast?.payload?.hourlyStaffing) ? forecast.payload.hourlyStaffing as Array<Record<string, unknown>> : [];
    const scheduledByHour = new Map<number, number>();
    for (const shift of shifts) {
      for (let hour = shift.shiftStart.getHours(); hour <= shift.shiftEnd.getHours(); hour += 1) {
        scheduledByHour.set(hour, (scheduledByHour.get(hour) ?? 0) + 1);
      }
    }
    return {
      generatedAt: new Date().toISOString(),
      hourly: Array.from({ length: 24 }, (_, hour) => {
        const recommended = hourlyForecast.find((row) => Number(row.hour) === hour);
        const required = Number(recommended?.recommendedPosStaff ?? 0) + Number(recommended?.recommendedFulfillmentStaff ?? 0);
        const scheduled = scheduledByHour.get(hour) ?? 0;
        return {
          hour,
          forecastedOrders: Number(recommended?.forecastedOrders ?? 0),
          requiredStaff: required,
          scheduledStaff: scheduled,
          status: scheduled < required ? 'understaffed' : scheduled > required + 1 ? 'overstaffed' : 'balanced',
        };
      }),
      laborCost: this.laborCost(shifts),
    };
  }

  private async listShifts(tenantId: string, from: Date, to: Date, locationId?: string, employeeId?: string) {
    return this.shifts.find({
      where: {
        tenantId,
        ...(locationId ? { locationId } : {}),
        ...(employeeId ? { employeeId } : {}),
        shiftStart: LessThan(to),
        shiftEnd: MoreThan(from),
      },
      order: { shiftStart: 'ASC' },
    });
  }

  private async detectConflicts(tenantId: string, employeeId: string, shiftStart: Date, shiftEnd: Date, ignoreId?: string) {
    const [overlaps, timeOff] = await Promise.all([
      this.shifts.find({
        where: { tenantId, employeeId, shiftStart: LessThan(shiftEnd), shiftEnd: MoreThan(shiftStart) },
      }),
      this.timeOff.find({
        where: { tenantId, employeeId, status: In(['pending', 'approved']), startAt: LessThan(shiftEnd), endAt: MoreThan(shiftStart) },
      }),
    ]);
    return [
      ...overlaps.filter((shift) => shift.id !== ignoreId).map((shift) => ({ type: 'overlap', shiftId: shift.id })),
      ...timeOff.map((request) => ({ type: 'time_off', requestId: request.id, status: request.status })),
    ];
  }

  private async conflicts(tenantId: string, shifts: StaffShiftEntity[]) {
    const map = new Map<string, Array<Record<string, unknown>>>();
    for (const shift of shifts) {
      const conflicts = await this.detectConflicts(tenantId, shift.employeeId, shift.shiftStart, shift.shiftEnd, shift.id);
      if (conflicts.length) map.set(shift.id, conflicts);
    }
    return map;
  }

  private laborCost(shifts: StaffShiftEntity[]) {
    const byDay = new Map<string, number>();
    let total = 0;
    let overtimeHours = 0;
    for (const shift of shifts) {
      const hours = Math.max(0, (shift.shiftEnd.getTime() - shift.shiftStart.getTime()) / 3_600_000);
      const breakHours = Number(shift.breakRules.unpaidBreakMinutes ?? 0) / 60;
      const paidHours = Math.max(0, hours - breakHours);
      const regularHours = Math.min(8, paidHours);
      const shiftOvertime = Math.max(0, paidHours - 8);
      const rate = Number(shift.hourlyRate ?? 0);
      const cost = regularHours * rate + shiftOvertime * rate * 1.5;
      const day = shift.shiftStart.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + cost);
      total += cost;
      overtimeHours += shiftOvertime;
    }
    return {
      total: total.toFixed(2),
      overtimeHours: Number(overtimeHours.toFixed(2)),
      byDay: [...byDay.entries()].sort().map(([date, cost]) => ({ date, cost: cost.toFixed(2) })),
    };
  }

  private roleCoverage(shifts: StaffShiftEntity[]) {
    return shifts.reduce<Record<string, number>>((acc, shift) => {
      acc[shift.role] = (acc[shift.role] ?? 0) + 1;
      return acc;
    }, {});
  }

  private async employeeMap(tenantId: string, ids: string[]) {
    const unique = [...new Set(ids)];
    if (!unique.length) return new Map<string, UserEntity>();
    const users = await this.users.find({ where: { tenantId, id: In(unique) } });
    return new Map(users.map((user) => [user.id, user]));
  }

  private toShiftView(shift: StaffShiftEntity, employee: UserEntity | undefined, conflicts: Array<Record<string, unknown>>) {
    return {
      ...shift,
      employeeName: employee?.name ?? shift.employeeId,
      employeeEmail: employee?.email ?? null,
      conflicts,
    };
  }

  private templateFor(name?: string | null) {
    return SHIFT_TEMPLATES.find((template) => template.name === name);
  }

  private async requireShift(tenantId: string, id: string) {
    const shift = await this.shifts.findOne({ where: { tenantId, id } });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  private async requireOwnShift(tenantId: string, user: AuthenticatedUser | undefined, shiftId: string) {
    if (!user) throw new BadRequestException('User is required');
    const shift = await this.requireShift(tenantId, shiftId);
    if (shift.employeeId !== user.id) throw new BadRequestException('Shift is not assigned to this employee');
    return shift;
  }

  private resolveRange(query: StaffScheduleQueryDto) {
    const from = query.from ? new Date(query.from) : this.startOfWeek(new Date());
    const to = query.to ? new Date(query.to) : new Date(from);
    if (!query.to) to.setDate(to.getDate() + (query.view === 'month' ? 31 : 7));
    return { from, to };
  }

  private startOfWeek(date: Date) {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - ((day + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return start;
  }
}
