import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundEntity } from '../../entities';
import { RefundsController } from '../../controllers';
import { RefundsService } from '../../services';
import { RefundRepository } from '../../repositories/refund.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RefundEntity])],
  controllers: [RefundsController],
  providers: [RefundsService, RefundRepository],
  exports: [],
})
export class RefundsModule {}
