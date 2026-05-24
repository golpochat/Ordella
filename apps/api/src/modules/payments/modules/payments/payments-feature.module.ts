import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentsController } from '../../controllers/payments.controller';
import { PaymentsService } from '../../services/payments.service';
import { PaymentRepository } from '../../repositories/payment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository],
  exports: [PaymentsService, PaymentRepository],
})
export class PaymentsFeatureModule {}
