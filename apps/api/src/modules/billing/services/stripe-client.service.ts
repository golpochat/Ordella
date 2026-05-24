import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeClientService {
  private readonly logger = new Logger(StripeClientService.name);
  private readonly stripe: Stripe | null;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = secret ? new Stripe(secret, { apiVersion: '2025-02-24.acacia' }) : null;
    if (!this.stripe) {
      this.logger.warn('STRIPE_SECRET_KEY not set — billing runs in placeholder mode');
    }
  }

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  client(): Stripe {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }
    return this.stripe;
  }

  getPriceIdForPlan(planId: string): string | null {
    const registryKey = {
      starter: 'STRIPE_PRICE_STARTER',
      pro: 'STRIPE_PRICE_PRO',
      enterprise: 'STRIPE_PRICE_ENTERPRISE',
    }[planId];
    if (!registryKey) {
      return null;
    }
    return this.config.get<string>(registryKey) ?? null;
  }

  webhookSecret(): string | undefined {
    return this.config.get<string>('STRIPE_WEBHOOK_SECRET');
  }
}
