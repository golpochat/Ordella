import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodEntity } from '../../entities/payment-method.entity';
import { PaymentMethodsController } from '../../controllers/payment-methods.controller';
import { PaymentMethodsService } from '../../services/payment-methods.service';
import { PaymentMethodRepository } from '../../repositories/payment-method.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethodEntity])],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, PaymentMethodRepository],
  exports: [PaymentMethodsService, PaymentMethodRepository],
})
export class PaymentMethodsModule {}
