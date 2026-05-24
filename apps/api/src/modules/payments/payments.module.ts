import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PAYMENTS_ENTITIES } from './entities';
import { PaymentsFeatureModule } from './modules/payments/payments-feature.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { PaymentAttemptsModule } from './modules/payment-attempts/payment-attempts.module';
import { PaymentsCoreModule } from './modules/payments-core/payments-core.module';
import { PaymentsTerminalModule } from './modules/payments-terminal/payments-terminal.module';

/**
 * Payments domain — SRS §9 Transactions & Payments, API Spec §6 (blueprint Payments Service).
 *
 * Routes (/api/v1, tenant-scoped):
 * - /payments, /refunds
 * - /payment-methods, /payment-attempts
 * - GET /payments/providers
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(PAYMENTS_ENTITIES),
    PaymentsFeatureModule,
    RefundsModule,
    PaymentMethodsModule,
    PaymentAttemptsModule,
    PaymentsCoreModule,
    PaymentsTerminalModule,
  ],
  exports: [PaymentsCoreModule],
})
export class PaymentsModule {}
