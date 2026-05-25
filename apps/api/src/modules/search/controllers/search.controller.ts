import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { ReindexSearchDto, SearchQueryDto, SemanticSearchQueryDto } from '../dto';
import { SearchIndexService } from '../services';

@Controller('search')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class SearchController {
  constructor(private readonly searchIndex: SearchIndexService) {}

  @Get()
  async search(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: SearchQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.searchIndex.search(tenant, query);
    return { success: true, data };
  }

  @Get('semantic')
  async semantic(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: SemanticSearchQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.searchIndex.semantic(tenant, query);
    return { success: true, data };
  }

  @Post('reindex')
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async reindex(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: ReindexSearchDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.searchIndex.reindex(tenant, dto);
    return { success: true, data };
  }
}
