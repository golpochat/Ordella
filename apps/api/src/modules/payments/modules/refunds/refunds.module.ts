import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundEntity } from '../../entities/refund.entity';
import { RefundsController } from '../../controllers/refunds.controller';
import { RefundsService } from '../../services/refunds.service';
import { RefundRepository } from '../../repositories/refund.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RefundEntity])],
  controllers: [RefundsController],
  providers: [RefundsService, RefundRepository],
  exports: [],
})
export class RefundsModule {}
