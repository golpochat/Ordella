import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RequirePermissions, RbacGuard } from '../../auth';
import { OnboardingPermissionKeys } from '../../../common/rbac/role-permissions';
import {
  AttachPaymentMethodDto,
  BillingPortalSessionDto,
  BillingSubscriptionCheckoutDto,
  ChangePlanDto,
  SubscribePlanDto,
} from '../dto/billing.dto';
import { TenantBillingService } from '../services/tenant-billing.service';
import { UsageTrackingService } from '../services/usage-tracking.service';

@Controller('billing')
@UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
export class BillingController {
  constructor(
    private readonly billingService: TenantBillingService,
    private readonly usageTracking: UsageTrackingService,
  ) {}

  @Get('usage')
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_READ)
  async getUsage(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const summary = await this.billingService.getBillingSummary(tenant.tenantId);
    return { success: true, data: summary };
  }

  @Get('invoices')
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_READ)
  async listInvoices(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.billingService.listInvoices(tenant.tenantId);
    return { success: true, data };
  }

  @Post('subscribe')
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_UPDATE)
  async subscribe(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: SubscribePlanDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.billingService.subscribeToPlan(
      user,
      tenant,
      dto.planId,
      dto.paymentMethodId,
    );
    return { success: true, data };
  }

  @Post('change-plan')
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_UPDATE)
  async changePlan(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: ChangePlanDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.billingService.handlePlanChange(user, tenant, dto.planId);
    return { success: true, data };
  }

  @Post('payment-method')
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_UPDATE)
  async attachPaymentMethod(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AttachPaymentMethodDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.billingService.attachPaymentMethod(
      user,
      tenant,
      dto.paymentMethodId,
    );
    return { success: true, data };
  }

  @Post('create-portal-session')
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_UPDATE)
  async createPortalSession(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: BillingPortalSessionDto,
  ): Promise<ApiSuccessResponse<{ url: string }>> {
    const data = await this.billingService.createBillingPortalSession(
      user,
      tenant,
      dto.returnUrl,
    );
    return { success: true, data };
  }

  @Post('create-subscription-checkout')
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_UPDATE)
  async createSubscriptionCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: BillingSubscriptionCheckoutDto,
  ): Promise<ApiSuccessResponse<{ sessionId: string; url: string }>> {
    const data = await this.billingService.createSubscriptionCheckoutSession(
      user,
      tenant,
      dto.planId,
      dto.successUrl,
      dto.cancelUrl,
    );
    return { success: true, data };
  }

  @Post('cancel')
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_UPDATE)
  async cancelSubscription(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.billingService.cancelSubscription(user, tenant);
    return { success: true, data };
  }
}
