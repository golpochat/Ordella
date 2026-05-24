import { Injectable, Logger } from '@nestjs/common';
import { PromotionEntity } from '../entities/promotion.entity';

@Injectable()
export class ExternalPromoProviderService {
  private readonly logger = new Logger(ExternalPromoProviderService.name);

  syncPromotion(promotion: PromotionEntity): void {
    this.logger.debug(
      `[placeholder] ExternalPromoProviderService sync promotion=${promotion.id} tenant=${promotion.tenantId}`,
    );
  }
}
