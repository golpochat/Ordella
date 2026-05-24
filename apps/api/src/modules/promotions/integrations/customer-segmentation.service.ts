import { Injectable, Logger } from '@nestjs/common';
import { PromotionOrderDraftContext } from '../types/promotion-order-draft.context';

@Injectable()
export class CustomerSegmentationService {
  private readonly logger = new Logger(CustomerSegmentationService.name);

  isInSegment(
    tenantId: string,
    customerId: string | null | undefined,
    segmentId: string,
  ): boolean {
    this.logger.debug(
      `[placeholder] CustomerSegmentationService tenant=${tenantId} customer=${customerId ?? 'guest'} segment=${segmentId}`,
    );
    void segmentId;
    return Boolean(customerId);
  }

  matchesContext(context: PromotionOrderDraftContext, segmentId: string): boolean {
    return this.isInSegment(context.tenantId, context.customerId, segmentId);
  }
}
