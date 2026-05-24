import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../../entities';
import { PaymentsController } from '../../controllers';
import { PaymentsService } from '../../services';
import { PaymentRepository } from '../../repositories/payment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository],
  exports: [],
})
export class PaymentsFeatureModule {}
