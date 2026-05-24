import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentAttemptEntity } from '../../entities/payment-attempt.entity';
import { PaymentAttemptsController } from '../../controllers/payment-attempts.controller';
import { PaymentAttemptsService } from '../../services/payment-attempts.service';
import { PaymentAttemptRepository } from '../../repositories/payment-attempt.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentAttemptEntity])],
  controllers: [PaymentAttemptsController],
  providers: [PaymentAttemptsService, PaymentAttemptRepository],
  exports: [],
})
export class PaymentAttemptsModule {}
