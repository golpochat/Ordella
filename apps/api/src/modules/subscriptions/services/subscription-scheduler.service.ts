import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);
  private interval: NodeJS.Timeout | null = null;

  constructor(private readonly subscriptions: SubscriptionsService) {}

  onModuleInit(): void {
    this.interval = setInterval(() => {
      void this.subscriptions.processDue().catch((error) => {
        this.logger.warn(`Failed to process recurring orders: ${(error as Error).message}`);
      });
    }, 60 * 60 * 1000);
  }

  onModuleDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}
