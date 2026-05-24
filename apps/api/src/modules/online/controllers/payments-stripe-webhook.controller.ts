import {
  BadRequestException,
  Controller,
  Headers,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../auth';
import { OnlineStripeCheckoutService } from '../services/online-stripe-checkout.service';

/** Stripe webhooks for order payments (checkout.session.completed, payment_intent.*) */
@Controller('payments/webhook')
export class PaymentsStripeWebhookController {
  private readonly logger = new Logger(PaymentsStripeWebhookController.name);

  constructor(private readonly stripeCheckout: OnlineStripeCheckoutService) {}

  @Public()
  @Post()
  async handle(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const payload = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body ?? {}));

    try {
      const event = this.stripeCheckout.constructEvent(payload, signature);
      await this.stripeCheckout.handleStripeEvent(event);
      return { received: true };
    } catch (error) {
      this.logger.warn(`Order Stripe webhook rejected: ${(error as Error).message}`);
      throw new BadRequestException('Invalid webhook signature or payload');
    }
  }
}
