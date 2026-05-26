import { StaffAttendanceLogEntity } from './staff-attendance-log.entity';
import { StaffScheduleEntity } from './staff-schedule.entity';
import { StaffShiftEntity } from './staff-shift.entity';
import { StaffShiftSwapRequestEntity } from './staff-shift-swap-request.entity';
import { StaffTimeOffRequestEntity } from './staff-time-off-request.entity';

export { StaffAttendanceLogEntity } from './staff-attendance-log.entity';
export { StaffScheduleEntity } from './staff-schedule.entity';
export { StaffShiftEntity } from './staff-shift.entity';
export { StaffShiftSwapRequestEntity } from './staff-shift-swap-request.entity';
export { StaffTimeOffRequestEntity } from './staff-time-off-request.entity';
export type { StaffScheduleStatus } from './staff-schedule.entity';
export type { StaffShiftRole, StaffShiftStatus } from './staff-shift.entity';
export type { StaffRequestStatus } from './staff-time-off-request.entity';

export const STAFF_SCHEDULING_ENTITIES = [
  StaffAttendanceLogEntity,
  StaffScheduleEntity,
  StaffShiftEntity,
  StaffShiftSwapRequestEntity,
  StaffTimeOffRequestEntity,
];
