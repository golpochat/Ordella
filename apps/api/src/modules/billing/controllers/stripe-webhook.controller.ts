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
import { StripeWebhookHandler } from '../services/stripe-webhook.handler';

@Controller('billing/webhook')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly webhookHandler: StripeWebhookHandler) {}

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
      const event = this.webhookHandler.constructEvent(payload, signature);
      await this.webhookHandler.handleEvent(event);
      return { received: true };
    } catch (error) {
      this.logger.warn(`Stripe webhook rejected: ${(error as Error).message}`);
      throw new BadRequestException('Invalid webhook signature or payload');
    }
  }
}
