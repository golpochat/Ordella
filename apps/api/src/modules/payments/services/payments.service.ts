import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentAttemptStatus } from '../enums/payment-attempt-status.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { parseAmount, formatAmount } from '../domain/payment-amount.util';
import { resolvePaymentProvider } from '../domain/payment-provider.util';
import {
  throwInvalidPaymentAmount,
  throwPaymentForOrderNotFound,
  throwRefundExceedsCaptured,
  throwRefundOnUnpaidPayment,
} from '../domain/payment-domain.errors';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentAttemptRepository } from '../repositories/payment-attempt.repository';
import { RefundRepository } from '../repositories/refund.repository';
import { PaymentGatewayRouter } from '../integrations/payment-gateway.router';
import { PaymentReconciliationService } from './payment-reconciliation.service';
import { PaymentOrderContext } from '../types/payment-order.context';
import {
  AuthorizeOrCaptureResult,
  PaymentIntentResult,
  RecordAttemptInput,
  RefundResult,
} from '../types/payment-processing.types';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentAttemptRepository: PaymentAttemptRepository,
    private readonly refundRepository: RefundRepository,
    private readonly gatewayRouter: PaymentGatewayRouter,
    private readonly reconciliationService: PaymentReconciliationService,
  ) {}

  async createPaymentIntent(context: PaymentOrderContext): Promise<PaymentIntentResult> {
    this.assertValidAmount(context.amount);

    return this.dataSource.transaction(async (manager) => {
      const existing = await this.paymentRepository.findByOrderForTenant(
        context.tenantId,
        context.orderId,
        manager,
        true,
      );

      if (existing) {
        if (existing.status === PaymentStatus.PENDING) {
          return { paymentId: existing.id, status: existing.status };
        }
        if (existing.status === PaymentStatus.CAPTURED) {
          return { paymentId: existing.id, status: existing.status };
        }
      }

      const payment = this.paymentRepository.create(
        {
          tenantId: context.tenantId,
          orderId: context.orderId,
          provider: resolvePaymentProvider(context.method),
          method: context.method,
          amount: formatAmount(parseAmount(context.amount)),
          currency: context.currency,
          status: PaymentStatus.PENDING,
          providerPaymentId: null,
          paymentMethodId: null,
          metadata: { customerId: context.customerId ?? null },
        },
        manager,
      );

      const saved = await this.paymentRepository.save(payment, manager);

      await this.recordAttempt(
        {
          paymentId: saved.id,
          status: PaymentAttemptStatus.PENDING,
          providerResponse: { action: 'create_payment_intent' },
        },
        manager,
      );

      return { paymentId: saved.id, status: saved.status };
    });
  }

  async authorizeOrCapture(context: PaymentOrderContext): Promise<AuthorizeOrCaptureResult> {
    this.assertValidAmount(context.amount);

    return this.dataSource.transaction(async (manager) => {
      const payment = await this.requirePaymentForOrder(context, manager, true);

      if (payment.status === PaymentStatus.CAPTURED) {
        return { paymentId: payment.id, status: 'captured' };
      }

      if (
        payment.status === PaymentStatus.REFUNDED ||
        payment.status === PaymentStatus.PARTIALLY_REFUNDED
      ) {
        return {
          paymentId: payment.id,
          status: 'failed',
          failureReason: `Payment is ${payment.status}`,
        };
      }

      if (payment.status === PaymentStatus.FAILED) {
        payment.status = PaymentStatus.PENDING;
      }

      const gateway = this.gatewayRouter.resolve(payment.provider);
      const skipAuthorize =
        payment.provider === PaymentProvider.CASH ||
        payment.provider === PaymentProvider.MANUAL;

      if (!skipAuthorize && payment.status === PaymentStatus.PENDING) {
        const authResult = await gateway.authorize(payment, context);

        if (!authResult.authorized) {
          payment.status = PaymentStatus.FAILED;
          await this.paymentRepository.save(payment, manager);
          await this.recordAttempt(
            {
              paymentId: payment.id,
              status: PaymentAttemptStatus.FAILED,
              errorCode: authResult.errorCode ?? 'authorization_failed',
              errorMessage: authResult.failureReason ?? 'Authorization failed',
            },
            manager,
          );
          return {
            paymentId: payment.id,
            status: 'failed',
            failureReason: authResult.failureReason,
          };
        }

        payment.status = PaymentStatus.AUTHORIZED;
        payment.providerPaymentId = authResult.externalRef;
        await this.paymentRepository.save(payment, manager);
        await this.recordAttempt(
          {
            paymentId: payment.id,
            status: PaymentAttemptStatus.SUCCEEDED,
            providerResponse: { action: 'authorize', externalRef: authResult.externalRef },
          },
          manager,
        );
      }

      const captureResult = await gateway.capture(payment, context);

      if (!captureResult.captured) {
        payment.status = PaymentStatus.FAILED;
        await this.paymentRepository.save(payment, manager);
        await this.recordAttempt(
          {
            paymentId: payment.id,
            status: PaymentAttemptStatus.FAILED,
            errorCode: captureResult.errorCode ?? 'capture_failed',
            errorMessage: captureResult.failureReason ?? 'Capture failed',
          },
          manager,
        );
        return {
          paymentId: payment.id,
          status: 'failed',
          failureReason: captureResult.failureReason,
        };
      }

      payment.status = PaymentStatus.CAPTURED;
      payment.providerPaymentId = captureResult.externalRef ?? payment.providerPaymentId;
      await this.paymentRepository.save(payment, manager);
      await this.recordAttempt(
        {
          paymentId: payment.id,
          status: PaymentAttemptStatus.SUCCEEDED,
          providerResponse: { action: 'capture', externalRef: captureResult.externalRef },
        },
        manager,
      );

      return { paymentId: payment.id, status: 'captured' };
    });
  }

  async markFailed(
    context: PaymentOrderContext,
    reason: string,
    errorCode = 'payment_failed',
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const payment = await this.requirePaymentForOrder(context, manager, true);
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment, manager);
      await this.recordAttempt(
        {
          paymentId: payment.id,
          status: PaymentAttemptStatus.FAILED,
          errorCode,
          errorMessage: reason,
        },
        manager,
      );
    });
  }

  async refund(context: PaymentOrderContext, amount?: string): Promise<RefundResult> {
    const refundAmount = amount ?? context.amount;
    this.assertValidAmount(refundAmount);

    return this.dataSource.transaction(async (manager) => {
      const payment = await this.requirePaymentForOrder(context, manager, true);

      if (
        payment.status !== PaymentStatus.CAPTURED &&
        payment.status !== PaymentStatus.PARTIALLY_REFUNDED
      ) {
        throwRefundOnUnpaidPayment(payment.status);
      }

      const captured = parseAmount(payment.amount);
      const alreadyRefunded = await this.refundRepository.sumSucceededForPayment(
        payment.id,
        manager,
      );
      const refundable = captured - alreadyRefunded;
      const requested = parseAmount(refundAmount);

      if (requested > refundable) {
        throwRefundExceedsCaptured(formatAmount(requested), formatAmount(refundable));
      }

      const gatewayResult = await this.gatewayRouter.refund(
        payment,
        context,
        formatAmount(requested),
      );

      if (!gatewayResult.succeeded) {
        return {
          refundId: '',
          status: 'failed',
          failureReason: gatewayResult.failureReason,
        };
      }

      const refund = await this.refundRepository.create(
        {
          paymentId: payment.id,
          amount: formatAmount(requested),
          reason: context.reason ?? null,
          providerRefundId: gatewayResult.externalRef,
        },
        manager,
      );

      const totalRefunded = alreadyRefunded + requested;
      payment.status =
        totalRefunded >= captured ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
      await this.paymentRepository.save(payment, manager);

      await this.recordAttempt(
        {
          paymentId: payment.id,
          status: PaymentAttemptStatus.SUCCEEDED,
          providerResponse: {
            action: 'refund',
            refundId: refund.id,
            amount: formatAmount(requested),
          },
        },
        manager,
      );

      return { refundId: refund.id, status: 'succeeded' };
    });
  }

  async getPaymentForOrder(tenantId: string, orderId: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findByOrderForTenant(tenantId, orderId);
    if (!payment) {
      throwPaymentForOrderNotFound(orderId);
    }
    return payment;
  }

  async recordAttempt(
    input: RecordAttemptInput,
    manager?: EntityManager,
  ): Promise<string> {
    const attemptNumber =
      (await this.paymentAttemptRepository.countForPayment(input.paymentId, manager)) + 1;

    const attempt = await this.paymentAttemptRepository.append(
      {
        paymentId: input.paymentId,
        attemptNumber,
        status: input.status,
        errorCode: input.errorCode ?? null,
        errorMessage: input.errorMessage ?? null,
        providerResponse: input.providerResponse,
      },
      manager,
    );

    return attempt.id;
  }

  async reconcileDaily(tenantId: string, dateIso: string): Promise<void> {
    await this.reconciliationService.reconcileDaily(tenantId, dateIso);
  }

  async reconcileByExternalRef(tenantId: string, externalRef: string): Promise<void> {
    await this.reconciliationService.reconcileByExternalRef(tenantId, externalRef);
  }

  private async requirePaymentForOrder(
    context: PaymentOrderContext,
    manager: EntityManager,
    lock: boolean,
  ): Promise<PaymentEntity> {
    let payment = await this.paymentRepository.findByOrderForTenant(
      context.tenantId,
      context.orderId,
      manager,
      lock,
    );

    if (!payment) {
      const intent = await this.createPaymentIntentInTransaction(context, manager);
      payment = await this.paymentRepository.findByIdForTenant(
        context.tenantId,
        intent.paymentId,
        manager,
        lock,
      );
    }

    if (!payment) {
      throwPaymentForOrderNotFound(context.orderId);
    }

    return payment;
  }

  private async createPaymentIntentInTransaction(
    context: PaymentOrderContext,
    manager: EntityManager,
  ): Promise<PaymentIntentResult> {
    const payment = this.paymentRepository.create(
      {
        tenantId: context.tenantId,
        orderId: context.orderId,
        provider: resolvePaymentProvider(context.method),
        method: context.method,
        amount: formatAmount(parseAmount(context.amount)),
        currency: context.currency,
        status: PaymentStatus.PENDING,
        providerPaymentId: null,
        paymentMethodId: null,
        metadata: { customerId: context.customerId ?? null },
      },
      manager,
    );
    const saved = await this.paymentRepository.save(payment, manager);
    return { paymentId: saved.id, status: saved.status };
  }

  private assertValidAmount(amount: string): void {
    if (parseAmount(amount) <= 0) {
      throwInvalidPaymentAmount(amount);
    }
  }
}
