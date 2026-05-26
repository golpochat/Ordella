import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import type { StaffShiftRole, StaffShiftStatus } from '../entities';

const shiftRoles = ['cashier', 'picker', 'driver', 'manager'] as const;
const shiftStatuses = ['scheduled', 'active', 'completed', 'cancelled'] as const;

export class StaffScheduleQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsIn(['week', 'month'])
  view?: 'week' | 'month';
}

export class UpsertStaffShiftDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  scheduleId?: string;

  @IsUUID()
  employeeId!: string;

  @IsUUID()
  locationId!: string;

  @IsIn(shiftRoles)
  role!: StaffShiftRole;

  @IsDateString()
  shiftStart!: string;

  @IsDateString()
  shiftEnd!: string;

  @IsOptional()
  @IsObject()
  breakRules?: Record<string, unknown>;

  @IsOptional()
  @IsIn(shiftStatuses)
  status?: StaffShiftStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  templateName?: string;
}

export class ClockShiftDto {
  @IsUUID()
  shiftId!: string;
}

export class TimeOffRequestDto {
  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ShiftSwapRequestDto {
  @IsUUID()
  shiftId!: string;

  @IsOptional()
  @IsUUID()
  targetEmployeeId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
