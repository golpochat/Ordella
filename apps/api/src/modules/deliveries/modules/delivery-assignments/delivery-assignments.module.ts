import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAssignmentEntity } from '../../entities';
import { DeliveryAssignmentsController } from '../../controllers';
import { DeliveryAssignmentsService } from '../../services';
import { DeliveryAssignmentRepository } from '../../repositories/delivery-assignment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAssignmentEntity])],
  controllers: [DeliveryAssignmentsController],
  providers: [DeliveryAssignmentsService, DeliveryAssignmentRepository],
  exports: [],
})
export class DeliveryAssignmentsModule {}
