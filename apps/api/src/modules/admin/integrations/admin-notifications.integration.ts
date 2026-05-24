import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '../../orders/enums/order-status.enum';

@Injectable()
export class AdminNotificationsIntegration {
  private readonly logger = new Logger(AdminNotificationsIntegration.name);

  resendOrderNotification(tenantId: string, orderId: string, status: OrderStatus): void {
    this.logger.debug(
      `[optional] resend notification tenant=${tenantId} order=${orderId} status=${status}`,
    );
  }
}
