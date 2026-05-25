import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { TaxReportQueryDto, UpsertTaxCategoryDto, UpsertTaxRuleDto } from '../dto';
import { TaxCategoriesService, TaxReportService, TaxRulesService } from '../services';

@Controller('tax')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
export class TaxController {
  constructor(
    private readonly taxRules: TaxRulesService,
    private readonly taxCategories: TaxCategoriesService,
    private readonly taxReport: TaxReportService,
  ) {}

  @Get('rules')
  async rules(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.taxRules.list(tenant.tenantId) };
  }

  @Post('rules/create')
  async createRule(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertTaxRuleDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.taxRules.create(tenant.tenantId, dto) };
  }

  @Post('rules/update')
  async updateRule(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertTaxRuleDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.taxRules.update(tenant.tenantId, dto) };
  }

  @Get('categories')
  async categories(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.taxCategories.list(tenant.tenantId) };
  }

  @Post('categories/create')
  async createCategory(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertTaxCategoryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.taxCategories.create(tenant.tenantId, dto) };
  }

  @Post('categories/update')
  async updateCategory(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertTaxCategoryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.taxCategories.update(tenant.tenantId, dto) };
  }

  @Get('report')
  async report(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: TaxReportQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.taxReport.report(tenant.tenantId, query) };
  }
}
