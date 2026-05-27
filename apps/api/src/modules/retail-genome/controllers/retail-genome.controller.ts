import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  GraphQueryDto,
  IngestPipelineDto,
  RunReasoningDto,
  SemanticSearchDto,
  TraverseGraphDto,
  VectorSearchDto,
} from '../dto';
import { RetailGenomeService } from '../services/retail-genome.service';

@Controller('retail-genome')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class RetailGenomeController {
  constructor(private readonly genome: RetailGenomeService) {}

  @Get('dashboard')
  @RequirePermissions('retail-genome.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.genome.dashboard(tenant) };
  }

  @Get('schema')
  @RequirePermissions('retail-genome.read')
  async schema(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.genome.getSchema(tenant) };
  }

  @Get('entities')
  @RequirePermissions('retail-genome.read')
  async entities(@CurrentTenant() tenant: TenantContext, @Query('entityType') entityType?: string) {
    return { success: true, data: await this.genome.listEntities(tenant, entityType) };
  }

  @Get('entities/:id/graph')
  @RequirePermissions('retail-genome.read')
  async entityGraph(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return { success: true, data: await this.genome.getEntityGraph(tenant, id) };
  }

  @Get('entities/:id/similarity')
  @RequirePermissions('retail-genome.read')
  async similarity(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return { success: true, data: await this.genome.similarityMap(tenant, id) };
  }

  @Get('relationships')
  @RequirePermissions('retail-genome.read')
  async relationships(
    @CurrentTenant() tenant: TenantContext,
    @Query('relationshipType') relationshipType?: string,
  ) {
    return { success: true, data: await this.genome.listRelationships(tenant, relationshipType) };
  }

  @Post('ingest')
  @RequirePermissions('retail-genome.ingest')
  async ingest(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: IngestPipelineDto,
  ) {
    return { success: true, data: await this.genome.runIngestion(tenant, user, dto) };
  }

  @Post('graph/query')
  @RequirePermissions('retail-genome.query')
  async graphQuery(@CurrentTenant() tenant: TenantContext, @Body() dto: GraphQueryDto) {
    return { success: true, data: await this.genome.graphQuery(tenant, dto) };
  }

  @Post('graph/traverse')
  @RequirePermissions('retail-genome.query')
  async traverse(@CurrentTenant() tenant: TenantContext, @Body() dto: TraverseGraphDto) {
    return { success: true, data: await this.genome.traverseGraph(tenant, dto) };
  }

  @Post('search/vector')
  @RequirePermissions('retail-genome.search')
  async vectorSearch(@CurrentTenant() tenant: TenantContext, @Body() dto: VectorSearchDto) {
    return { success: true, data: await this.genome.vectorSearch(tenant, dto) };
  }

  @Post('search/semantic')
  @RequirePermissions('retail-genome.search')
  async semanticSearch(@CurrentTenant() tenant: TenantContext, @Body() dto: SemanticSearchDto) {
    return { success: true, data: await this.genome.semanticSearch(tenant, dto) };
  }

  @Post('reasoning')
  @RequirePermissions('retail-genome.reasoning')
  async reasoning(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RunReasoningDto,
  ) {
    return { success: true, data: await this.genome.runReasoning(tenant, user, dto) };
  }

  @Get('reasoning')
  @RequirePermissions('retail-genome.read')
  async listReasoning(
    @CurrentTenant() tenant: TenantContext,
    @Query('reasoningType') reasoningType?: string,
  ) {
    return { success: true, data: await this.genome.listReasoning(tenant, reasoningType) };
  }

  @Post('embeddings/refresh')
  @RequirePermissions('retail-genome.admin')
  async refreshEmbeddings(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return { success: true, data: await this.genome.refreshEmbeddings(tenant, user) };
  }

  @Get('embeddings/preview')
  @RequirePermissions('retail-genome.read')
  async embeddingsPreview(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.genome.listEmbeddingsPreview(tenant) };
  }

  @Post('snapshots')
  @RequirePermissions('retail-genome.admin')
  async snapshot(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return { success: true, data: await this.genome.createSnapshot(tenant, user) };
  }

  @Post('federated/round')
  @RequirePermissions('retail-genome.federated')
  async federatedRound(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return { success: true, data: await this.genome.runFederatedRound(tenant, user) };
  }

  @Get('federated/patterns')
  @RequirePermissions('retail-genome.read')
  async globalPatterns() {
    return { success: true, data: await this.genome.listGlobalPatterns() };
  }

  @Get('lineage')
  @RequirePermissions('retail-genome.governance')
  async lineage(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.genome.listLineage(tenant) };
  }

  @Get('integrations')
  @RequirePermissions('retail-genome.read')
  async integrations() {
    return { success: true, data: await this.genome.listIntegrations() };
  }
}
