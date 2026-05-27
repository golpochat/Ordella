import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  ConvertCurrencyDto,
  ReportingQueryDto,
  TaxPreviewDto,
  UpdateGlobalizationSettingsDto,
  UpsertCountryPriceDto,
  UpsertLocalizedContentDto,
  UpsertTaxExemptionDto,
} from '../dto';
import { CountryCatalogRuleEntity, CountryDeliveryRuleEntity, CountryPromotionRuleEntity } from '../entities';
import { GlobalizationService } from '../services';

@Controller('globalization')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class GlobalizationController {
  constructor(private readonly globalization: GlobalizationService) {}

  @Get('dashboard')
  @RequirePermissions('globalization.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.dashboard(tenant) };
  }

  @Get('settings')
  @RequirePermissions('globalization.read')
  async settings(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.getSettings(tenant) };
  }

  @Put('settings')
  @RequirePermissions('globalization.admin')
  async updateSettings(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpdateGlobalizationSettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.updateSettings(tenant, user, dto) };
  }

  @Get('fx-rates')
  @RequirePermissions('globalization.read')
  async fxRates(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.listFxRates(tenant) };
  }

  @Post('fx-rates/refresh')
  @RequirePermissions('globalization.admin')
  async refreshFx(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.refreshFxRates(tenant, user) };
  }

  @Post('convert')
  @RequirePermissions('globalization.read')
  async convert(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: ConvertCurrencyDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.convert(tenant, dto) };
  }

  @Get('format/currency')
  @RequirePermissions('globalization.read')
  async formatCurrency(
    @CurrentTenant() tenant: TenantContext,
    @Query('amount') amount: string,
    @Query('currency') currency?: string,
    @Query('locale') locale?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: { formatted: await this.globalization.formatAmount(tenant, Number(amount), currency, locale) } };
  }

  @Post('tax/preview')
  @RequirePermissions('globalization.tax')
  async taxPreview(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: TaxPreviewDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.previewTax(tenant, dto) };
  }

  @Get('prices')
  @RequirePermissions('globalization.read')
  async prices(
    @CurrentTenant() tenant: TenantContext,
    @Query('countryCode') countryCode?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.listPrices(tenant, countryCode) };
  }

  @Post('prices')
  @RequirePermissions('globalization.admin')
  async upsertPrice(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpsertCountryPriceDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.upsertPrice(tenant, user, dto) };
  }

  @Get('catalog-rules')
  @RequirePermissions('globalization.read')
  async catalogRules(
    @CurrentTenant() tenant: TenantContext,
    @Query('countryCode') countryCode?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.listCatalogRules(tenant, countryCode) };
  }

  @Post('catalog-rules')
  @RequirePermissions('globalization.admin')
  async upsertCatalogRule(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: Partial<CountryCatalogRuleEntity>,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.upsertCatalogRule(tenant, body) };
  }

  @Get('delivery-rules')
  @RequirePermissions('globalization.read')
  async deliveryRules(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.listDeliveryRules(tenant) };
  }

  @Post('delivery-rules')
  @RequirePermissions('globalization.admin')
  async upsertDeliveryRule(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: Partial<CountryDeliveryRuleEntity>,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.upsertDeliveryRule(tenant, body) };
  }

  @Get('promotion-rules')
  @RequirePermissions('globalization.read')
  async promotionRules(
    @CurrentTenant() tenant: TenantContext,
    @Query('countryCode') countryCode?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.listPromotionRules(tenant, countryCode) };
  }

  @Post('promotion-rules')
  @RequirePermissions('globalization.admin')
  async upsertPromotionRule(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: Partial<CountryPromotionRuleEntity>,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.upsertPromotionRule(tenant, body) };
  }

  @Get('tax-exemptions')
  @RequirePermissions('globalization.tax')
  async taxExemptions(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.listTaxExemptions(tenant) };
  }

  @Post('tax-exemptions')
  @RequirePermissions('globalization.tax')
  async upsertTaxExemption(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpsertTaxExemptionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.upsertTaxExemption(tenant, user, dto) };
  }

  @Get('localized-content')
  @RequirePermissions('globalization.read')
  async localizedContent(
    @CurrentTenant() tenant: TenantContext,
    @Query('entityType') entityType?: string,
    @Query('locale') locale?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.listLocalizedContent(tenant, entityType, locale) };
  }

  @Post('localized-content')
  @RequirePermissions('globalization.admin')
  async upsertLocalizedContent(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertLocalizedContentDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.upsertLocalizedContent(tenant, dto) };
  }

  @Get('compliance')
  @RequirePermissions('globalization.compliance')
  async compliance(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.listComplianceProfiles(tenant) };
  }

  @Get('compliance/:countryCode/export')
  @RequirePermissions('globalization.compliance')
  async exportTax(
    @CurrentTenant() tenant: TenantContext,
    @Param('countryCode') countryCode: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.exportTaxReport(tenant, countryCode) };
  }

  @Get('reporting')
  @RequirePermissions('globalization.reporting')
  async reporting(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ReportingQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.globalization.reportingDashboard(tenant, query) };
  }
}
