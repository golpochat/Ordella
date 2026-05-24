import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import { OnlineStripeCheckoutService } from '../services/online-stripe-checkout.service';

/** Order payments — Stripe Checkout (storefront) */
@Controller('payments')
@UseGuards(TenantGuard)
export class PaymentsCheckoutController {
  constructor(private readonly stripeCheckout: OnlineStripeCheckoutService) {}

  @Get('config')
  getConfig(
    @CurrentTenant() _tenant: TenantContext,
  ): ApiSuccessResponse<{ publishableKey: string | null; stripeConfigured: boolean }> {
    return { success: true, data: this.stripeCheckout.getPublicConfig() };
  }

  @Post('checkout-session')
  async createCheckoutSession(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<ApiSuccessResponse<{ sessionId: string; url: string }>> {
    const data = await this.stripeCheckout.createCheckoutSession(tenant, dto);
    return { success: true, data };
  }

  @Post('checkout/complete')
  async completeCheckout(
    @CurrentTenant() tenant: TenantContext,
    @Query('session_id') sessionId: string,
  ): Promise<ApiSuccessResponse<{ orderId: string; orderNumber: string | null }>> {
    if (!sessionId?.trim()) {
      throw new BadRequestException('session_id is required');
    }
    const data = await this.stripeCheckout.completeCheckoutSession(tenant, sessionId.trim());
    return { success: true, data };
  }
}
