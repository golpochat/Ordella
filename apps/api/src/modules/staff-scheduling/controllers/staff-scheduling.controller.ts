import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { ClockShiftDto, ShiftSwapRequestDto, StaffScheduleQueryDto, TimeOffRequestDto, UpsertStaffShiftDto } from '../dto';
import { StaffSchedulingService } from '../services';
import type { StaffShiftRole } from '../entities';

@Controller('staff-scheduling')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class StaffSchedulingController {
  constructor(private readonly scheduling: StaffSchedulingService) {}

  @Get('roster')
  @RequirePermissions('staff.read')
  async roster(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: StaffScheduleQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.roster(tenant, query);
    return { success: true, data };
  }

  @Post('shifts/upsert')
  @RequirePermissions('staff.write')
  async upsertShift(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertStaffShiftDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.upsertShift(tenant, dto);
    return { success: true, data };
  }

  @Get('attendance')
  @RequirePermissions('staff.read')
  async attendance(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: StaffScheduleQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.attendanceLogs(tenant, query);
    return { success: true, data };
  }

  @Get('availability')
  @RequirePermissions('staff.read')
  async availability(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: StaffScheduleQueryDto & { role?: StaffShiftRole },
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.availability(tenant, query);
    return { success: true, data };
  }

  @Get('labor-forecast')
  @RequirePermissions('staff.read')
  async laborForecast(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: StaffScheduleQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.laborForecast(tenant, query);
    return { success: true, data };
  }

  @Get('employee/portal')
  @RequirePermissions('staff.read')
  async employeePortal(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query() query: StaffScheduleQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.employeePortal(tenant, user, query);
    return { success: true, data };
  }

  @Post('employee/clock-in')
  @RequirePermissions('staff.read')
  async clockIn(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: ClockShiftDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.clockIn(tenant, user, dto);
    return { success: true, data };
  }

  @Post('employee/clock-out')
  @RequirePermissions('staff.read')
  async clockOut(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: ClockShiftDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.clockOut(tenant, user, dto);
    return { success: true, data };
  }

  @Post('employee/time-off')
  @RequirePermissions('staff.read')
  async requestTimeOff(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: TimeOffRequestDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.requestTimeOff(tenant, user, dto);
    return { success: true, data };
  }

  @Post('employee/swap')
  @RequirePermissions('staff.read')
  async requestSwap(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: ShiftSwapRequestDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.scheduling.requestSwap(tenant, user, dto);
    return { success: true, data };
  }
}
