import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  CompareScenariosDto,
  CreateTwinDto,
  ForecastSandboxDto,
  ParallelSimulationsDto,
  RunSimulationDto,
  SaveScenarioDto,
} from '../dto';
import { DigitalTwinsService } from '../services';

@Controller('digital-twins')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class DigitalTwinsController {
  constructor(private readonly digitalTwins: DigitalTwinsService) {}

  @Get('dashboard')
  @RequirePermissions('digital-twins.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.dashboard(tenant) };
  }

  @Get('twins')
  @RequirePermissions('digital-twins.read')
  async listTwins(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.listTwins(tenant) };
  }

  @Post('twins')
  @RequirePermissions('digital-twins.admin')
  async createTwin(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: CreateTwinDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.createTwin(tenant, user, dto) };
  }

  @Get('twins/:id')
  @RequirePermissions('digital-twins.read')
  async getTwin(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.getTwin(tenant, id) };
  }

  @Post('twins/:id/publish')
  @RequirePermissions('digital-twins.admin')
  async publish(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.publishVersion(tenant, user, id) };
  }

  @Post('twins/:id/scenarios')
  @RequirePermissions('digital-twins.admin')
  async saveScenario(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: SaveScenarioDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.saveScenario(tenant, user, id, dto) };
  }

  @Post('twins/:id/simulate')
  @RequirePermissions('digital-twins.simulate')
  async simulate(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: RunSimulationDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.runSimulation(tenant, user, id, dto) };
  }

  @Post('twins/:id/simulate/parallel')
  @RequirePermissions('digital-twins.simulate')
  async simulateParallel(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: ParallelSimulationsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.runParallel(tenant, user, id, dto) };
  }

  @Post('twins/:id/compare')
  @RequirePermissions('digital-twins.read')
  async compare(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: CompareScenariosDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.compareScenarios(tenant, id, dto) };
  }

  @Post('forecast-sandbox')
  @RequirePermissions('digital-twins.simulate')
  async forecastSandbox(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: ForecastSandboxDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.forecastSandbox(tenant, user, dto) };
  }

  @Get('runs/:id')
  @RequirePermissions('digital-twins.read')
  async getRun(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.digitalTwins.getRun(tenant, id) };
  }
}
