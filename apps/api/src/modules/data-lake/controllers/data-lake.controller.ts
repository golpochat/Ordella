import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  ComputeFeaturesDto,
  CreateExportDto,
  QueryWarehouseDto,
  RunPipelineDto,
  StreamIngestDto,
  UpdateGovernanceDto,
} from '../dto';
import { DataLakeService } from '../services';

@Controller('data-lake')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class DataLakeController {
  constructor(private readonly dataLake: DataLakeService) {}

  @Get('dashboard')
  @RequirePermissions('data-lake.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.dashboard(tenant) };
  }

  @Get('schemas')
  @RequirePermissions('data-lake.read')
  async schemas(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.listSchemas(tenant) };
  }

  @Get('partitions')
  @RequirePermissions('data-lake.read')
  async partitions(
    @CurrentTenant() tenant: TenantContext,
    @Query('zoneKey') zoneKey?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.listPartitions(tenant, zoneKey) };
  }

  @Get('warehouse/tables')
  @RequirePermissions('data-lake.read')
  async warehouseTables(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.listWarehouseTables(tenant) };
  }

  @Post('warehouse/query')
  @RequirePermissions('data-lake.query')
  async queryWarehouse(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: QueryWarehouseDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.queryWarehouse(tenant, user, dto) };
  }

  @Get('pipelines/runs')
  @RequirePermissions('data-lake.read')
  async pipelineRuns(
    @CurrentTenant() tenant: TenantContext,
    @Query('pipelineKey') pipelineKey?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.listPipelineRuns(tenant, pipelineKey) };
  }

  @Post('pipelines/run')
  @RequirePermissions('data-lake.admin')
  async runPipeline(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: RunPipelineDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.runPipeline(tenant, user, dto) };
  }

  @Post('ingest/stream')
  @RequirePermissions('data-lake.ingest')
  async streamIngest(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: StreamIngestDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.streamIngest(tenant, user, dto) };
  }

  @Post('features/compute')
  @RequirePermissions('data-lake.admin')
  async computeFeatures(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: ComputeFeaturesDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.computeFeatures(tenant, user, dto) };
  }

  @Post('exports')
  @RequirePermissions('data-lake.export')
  async createExport(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: CreateExportDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.createExport(tenant, user, dto) };
  }

  @Get('exports')
  @RequirePermissions('data-lake.read')
  async exports(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.listExports(tenant) };
  }

  @Get('governance')
  @RequirePermissions('data-lake.governance')
  async governance(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.listGovernance(tenant) };
  }

  @Put('governance/:policyKey')
  @RequirePermissions('data-lake.governance')
  async updateGovernance(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('policyKey') policyKey: string,
    @Body() dto: UpdateGovernanceDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.updateGovernance(tenant, user, policyKey, dto) };
  }

  @Post('warehouse/materialized-views/refresh')
  @RequirePermissions('data-lake.admin')
  async refreshViews(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.dataLake.refreshMaterializedViews(tenant, user) };
  }
}
