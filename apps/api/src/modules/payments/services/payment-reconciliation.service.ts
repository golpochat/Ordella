import { Injectable, Logger } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';

/** Placeholder — daily settlement / gateway reconciliation jobs */
@Injectable()
export class PaymentReconciliationService {
  private readonly logger = new Logger(PaymentReconciliationService.name);

  constructor(private readonly paymentRepository: PaymentRepository) {}

  async reconcileDaily(tenantId: string, dateIso: string): Promise<void> {
    this.logger.debug(
      `[placeholder] PaymentReconciliationService.reconcileDaily tenant=${tenantId} date=${dateIso}`,
    );
    void this.paymentRepository;
  }

  async reconcileByExternalRef(tenantId: string, externalRef: string): Promise<void> {
    this.logger.debug(
      `[placeholder] PaymentReconciliationService.reconcileByExternalRef tenant=${tenantId} ref=${externalRef}`,
    );
  }
}
