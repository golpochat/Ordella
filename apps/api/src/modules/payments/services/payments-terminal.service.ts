import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { StripeClientService } from '../../billing/services/stripe-client.service';
import { OrdersService } from '../../orders/services/orders.service';
import { CreateTerminalPaymentIntentDto } from '../dto/create-terminal-payment-intent.dto';
import { ConfirmTerminalPaymentDto } from '../dto/confirm-terminal-payment.dto';

const DEFAULT_CURRENCY = 'EUR';

@Injectable()
export class PaymentsTerminalService {
  constructor(
    private readonly stripeClient: StripeClientService,
    private readonly ordersService: OrdersService,
  ) {}

  async createPaymentIntent(
    tenant: TenantContext,
    _user: AuthenticatedUser,
    dto: CreateTerminalPaymentIntentDto,
  ): Promise<{ paymentIntentId: string; clientSecret: string | null }> {
    const order = await this.ordersService.findOne(tenant, dto.orderId);
    const currency = (dto.currency ?? DEFAULT_CURRENCY).toLowerCase();
    const amountCents = Math.round(parseFloat(order.total) * 100);

    if (!this.stripeClient.isConfigured()) {
      return {
        paymentIntentId: `pi_placeholder_${order.id.slice(0, 8)}`,
        clientSecret: null,
      };
    }

    const intent = await this.stripeClient.client().paymentIntents.create({
      amount: amountCents,
      currency,
      capture_method: 'automatic',
      payment_method_types: ['card_present', 'card'],
      metadata: {
        tenantId: tenant.tenantId,
        orderId: order.id,
        type: 'pos_terminal',
        terminalId: dto.terminalId ?? '',
      },
    });

    return {
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
    };
  }

  async confirmPaymentIntent(
    tenant: TenantContext,
    _user: AuthenticatedUser,
    dto: ConfirmTerminalPaymentDto,
  ): Promise<{ paymentIntentId: string; status: string }> {
    await this.ordersService.findOne(tenant, dto.orderId);

    if (!this.stripeClient.isConfigured()) {
      return { paymentIntentId: dto.paymentIntentId, status: 'succeeded' };
    }

    const intent = await this.stripeClient.client().paymentIntents.retrieve(dto.paymentIntentId);
    if (intent.metadata?.tenantId !== tenant.tenantId) {
      throw new BadRequestException('Payment intent does not belong to this business');
    }
    if (intent.metadata?.orderId !== dto.orderId) {
      throw new BadRequestException('Payment intent does not match this order');
    }

    return { paymentIntentId: intent.id, status: intent.status };
  }
}
