import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CurrentCustomer } from '../../customer-accounts/decorators/current-customer.decorator';
import { CustomerAuthGuard } from '../../customer-accounts/guards/customer-auth.guard';
import { CustomerAuthPayload } from '../../customer-accounts/types/customer-auth-payload';
import {
  CreateSubscriptionDto,
  StorefrontCreateSubscriptionDto,
  SubscribeToPlanDto,
  UpdateSubscriptionDto,
  UpsertSubscriptionPlanDto,
} from '../dto';
import { SubscriptionStatus } from '../entities';
import { SubscriptionsService } from '../services';

@Controller('subscriptions')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class AdminSubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  @RequirePermissions('subscriptions.read')
  async list(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.subscriptions.list(tenant);
    return { success: true, data };
  }

  @Get('analytics')
  @RequirePermissions('subscriptions.read')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.analytics(tenant);
    return { success: true, data };
  }

  @Get('plans')
  @RequirePermissions('subscriptions.read')
  async listPlans(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.subscriptions.listPlans(tenant, true);
    return { success: true, data };
  }

  @Post('plans')
  @RequirePermissions('subscriptions.write')
  async upsertPlan(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertSubscriptionPlanDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.upsertPlan(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('subscriptions.read')
  async get(@CurrentTenant() tenant: TenantContext, @Param('id') id: string): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.get(tenant, id);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('subscriptions.write')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateSubscriptionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.create(tenant, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('subscriptions.write')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.update(tenant, id, dto);
    return { success: true, data };
  }

  @Post(':id/pause')
  @RequirePermissions('subscriptions.write')
  async pause(@CurrentTenant() tenant: TenantContext, @Param('id') id: string): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.setStatus(tenant, id, SubscriptionStatus.PAUSED);
    return { success: true, data };
  }

  @Post(':id/cancel')
  @RequirePermissions('subscriptions.write')
  async cancel(@CurrentTenant() tenant: TenantContext, @Param('id') id: string): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.setStatus(tenant, id, SubscriptionStatus.CANCELLED);
    return { success: true, data };
  }

  @Post('process-due')
  @RequirePermissions('subscriptions.write')
  async processDue(): Promise<ApiSuccessResponse<{ processed: number }>> {
    const processed = await this.subscriptions.processDue();
    return { success: true, data: { processed } };
  }
}

@Controller('public/customer/subscriptions')
@UseGuards(TenantGuard, CustomerAuthGuard)
export class CustomerSubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  async list(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.subscriptions.list(tenant, customer.sub);
    return { success: true, data };
  }

  @Get('plans')
  async listPlans(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.subscriptions.listPlans(tenant);
    return { success: true, data };
  }

  @Post('plans/:planId/subscribe')
  async subscribe(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('planId') planId: string,
    @Body() dto: Omit<SubscribeToPlanDto, 'planId'>,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.subscribeToPlan(tenant, customer.sub, { ...dto, planId });
    return { success: true, data };
  }

  @Get(':id')
  async get(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.get(tenant, id, customer.sub);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.update(tenant, id, dto, customer.sub);
    return { success: true, data };
  }

  @Post(':id/pause')
  async pause(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.setStatus(tenant, id, SubscriptionStatus.PAUSED, customer.sub);
    return { success: true, data };
  }

  @Post(':id/cancel')
  async cancel(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.setStatus(tenant, id, SubscriptionStatus.CANCELLED, customer.sub);
    return { success: true, data };
  }
}

@Controller('public/subscriptions')
@UseGuards(TenantGuard, CustomerAuthGuard)
export class StorefrontSubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Post('checkout-session')
  async createCheckoutSession(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Body() dto: StorefrontCreateSubscriptionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.subscriptions.createCheckoutSession(tenant, {
      ...dto,
      customerId: customer.sub,
    });
    return { success: true, data };
  }
}
