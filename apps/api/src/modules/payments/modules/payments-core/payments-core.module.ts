import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity, PaymentAttemptEntity, RefundEntity } from '../../entities';
import { PaymentsService } from '../../services/payments.service';
import { PaymentReconciliationService } from '../../services/payment-reconciliation.service';
import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentAttemptRepository } from '../../repositories/payment-attempt.repository';
import { RefundRepository } from '../../repositories/refund.repository';
import {
  CashDrawerGateway,
  PayPalGateway,
  PaymentGatewayRouter,
  SquareGateway,
  StripeGateway,
  TerminalPaymentsGateway,
} from '../../integrations';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, PaymentAttemptEntity, RefundEntity])],
  providers: [
    PaymentsService,
    PaymentReconciliationService,
    PaymentRepository,
    PaymentAttemptRepository,
    RefundRepository,
    PaymentGatewayRouter,
    StripeGateway,
    PayPalGateway,
    SquareGateway,
    CashDrawerGateway,
    TerminalPaymentsGateway,
  ],
  exports: [PaymentsService],
})
export class PaymentsCoreModule {}
