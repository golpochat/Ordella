import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { BillingRepository } from '../repositories/billing.repository';
import { TenantBillingService } from './tenant-billing.service';
import { StripeClientService } from './stripe-client.service';

@Injectable()
export class StripeWebhookHandler {
  private readonly logger = new Logger(StripeWebhookHandler.name);

  constructor(
    private readonly stripeClient: StripeClientService,
    private readonly billingService: TenantBillingService,
    private readonly repository: BillingRepository,
  ) {}

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    const secret = this.stripeClient.webhookSecret();
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return this.stripeClient.client().webhooks.constructEvent(payload, signature, secret);
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.billingService.syncStripeSubscriptionStatus(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const billing = await this.repository.findBillingByStripeSubscription(subscription.id);
        if (billing) {
          billing.subscriptionStatus = SubscriptionStatus.CANCELED;
          billing.stripeSubscriptionId = null;
          await this.repository.saveBilling(billing);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const sub = await this.stripeClient.client().subscriptions.retrieve(invoice.subscription);
          await this.billingService.syncStripeSubscriptionStatus(sub);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          const billing = await this.repository.findBillingByStripeCustomer(customerId);
          if (billing) {
            billing.subscriptionStatus = SubscriptionStatus.PAST_DUE;
            await this.repository.saveBilling(billing);
          }
        }
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === 'subscription_checkout' && session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const sub = await this.stripeClient.client().subscriptions.retrieve(subscriptionId);
          await this.billingService.syncStripeSubscriptionStatus(sub);
        }
        break;
      }
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
        break;
      case 'payment_method.attached': {
        const pm = event.data.object as Stripe.PaymentMethod;
        const customerId =
          typeof pm.customer === 'string' ? pm.customer : pm.customer?.id ?? null;
        if (!customerId) break;
        const billing = await this.repository.findBillingByStripeCustomer(customerId);
        if (billing) {
          billing.paymentMethod = {
            provider: 'stripe',
            paymentMethodId: pm.id,
            brand: pm.card?.brand ?? null,
            last4: pm.card?.last4 ?? null,
            expMonth: pm.card?.exp_month ?? null,
            expYear: pm.card?.exp_year ?? null,
          };
          await this.repository.saveBilling(billing);
        }
        break;
      }
      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }
  }
}
