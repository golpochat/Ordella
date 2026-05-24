import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodEntity } from '../../entities';
import { PaymentMethodsController } from '../../controllers';
import { PaymentMethodsService } from '../../services';
import { PaymentMethodRepository } from '../../repositories/payment-method.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethodEntity])],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, PaymentMethodRepository],
  exports: [],
})
export class PaymentMethodsModule {}
