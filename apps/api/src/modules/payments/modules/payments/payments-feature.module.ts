import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../../entities';
import { PaymentsController } from '../../controllers';
import { PaymentsCrudService } from '../../services/payments-crud.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsCrudService],
  exports: [],
})
export class PaymentsFeatureModule {}
