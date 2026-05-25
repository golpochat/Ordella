import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MarketingCampaignsService } from './marketing-campaigns.service';

@Injectable()
export class MarketingSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketingSchedulerService.name);
  private interval: NodeJS.Timeout | null = null;

  constructor(private readonly campaigns: MarketingCampaignsService) {}

  onModuleInit(): void {
    this.interval = setInterval(() => {
      void this.campaigns.processScheduled().catch((error) => {
        this.logger.warn(`Failed to process scheduled marketing campaigns: ${(error as Error).message}`);
      });
    }, 60_000);
  }

  onModuleDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}
