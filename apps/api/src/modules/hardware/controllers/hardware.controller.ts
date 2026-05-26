import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  AckDeviceCommandDto,
  DeviceHeartbeatDto,
  DispatchDeviceCommandDto,
  HardwareDeviceQueryDto,
  IngestDeviceEventDto,
  RegisterHardwareDeviceDto,
  UpdateHardwareDeviceDto,
} from '../dto';
import { HardwareService } from '../services/hardware.service';

@Controller('hardware/devices')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class HardwareController {
  constructor(private readonly hardware: HardwareService) {}

  @Get()
  @RequirePermissions('hardware.read')
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: HardwareDeviceQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.list(tenant, query);
    return { success: true, data };
  }

  @Get('summary')
  @RequirePermissions('hardware.read')
  async summary(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.summary(tenant);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('hardware.write')
  async register(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterHardwareDeviceDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.register(tenant, dto, user);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('hardware.write')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHardwareDeviceDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.update(tenant, id, dto, user);
    return { success: true, data };
  }

  @Get(':id/logs')
  @RequirePermissions('hardware.read')
  async logs(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.logsForDevice(tenant, id);
    return { success: true, data };
  }

  @Post('heartbeat')
  @RequirePermissions('hardware.gateway')
  async heartbeat(
    @CurrentTenant() tenant: TenantContext,
    @Headers('x-device-token') token: string | undefined,
    @Body() dto: DeviceHeartbeatDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.heartbeat(tenant, dto, token);
    return { success: true, data };
  }

  @Post(':id/commands')
  @RequirePermissions('hardware.command')
  async dispatchCommand(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DispatchDeviceCommandDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.dispatchCommand(tenant, id, dto, user);
    return { success: true, data };
  }

  @Get(':deviceId/commands/pending')
  @RequirePermissions('hardware.gateway')
  async pendingCommands(
    @CurrentTenant() tenant: TenantContext,
    @Headers('x-device-token') token: string | undefined,
    @Param('deviceId') deviceId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.pendingCommands(tenant.tenantId, deviceId, token);
    return { success: true, data };
  }

  @Post('commands/:id/ack')
  @RequirePermissions('hardware.gateway')
  async acknowledgeCommand(
    @CurrentTenant() tenant: TenantContext,
    @Headers('x-device-token') token: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AckDeviceCommandDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.acknowledgeCommand(tenant, id, dto, token);
    return { success: true, data };
  }

  @Post('events')
  @RequirePermissions('hardware.gateway')
  async ingestEvent(
    @CurrentTenant() tenant: TenantContext,
    @Headers('x-device-token') token: string | undefined,
    @Body() dto: IngestDeviceEventDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hardware.ingestEvent(tenant, dto, token);
    return { success: true, data };
  }
}
