import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentAttemptEntity } from '../../entities';
import { PaymentAttemptsController } from '../../controllers';
import { PaymentAttemptsService } from '../../services';
import { PaymentAttemptRepository } from '../../repositories/payment-attempt.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentAttemptEntity])],
  controllers: [PaymentAttemptsController],
  providers: [PaymentAttemptsService, PaymentAttemptRepository],
  exports: [],
})
export class PaymentAttemptsModule {}
