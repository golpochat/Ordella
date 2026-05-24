import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoyaltyPointsService {
  private readonly logger = new Logger(LoyaltyPointsService.name);

  accrueForApplication(tenantId: string, customerId: string | null, points: number): void {
    this.logger.debug(
      `[placeholder] LoyaltyPointsService.accrue tenant=${tenantId} customer=${customerId ?? 'guest'} points=${points}`,
    );
  }
}
