import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAssignmentEntity } from '../../entities/delivery-assignment.entity';
import { DeliveryAssignmentsController } from '../../controllers/delivery-assignments.controller';
import { DeliveryAssignmentsService } from '../../services/delivery-assignments.service';
import { DeliveryAssignmentRepository } from '../../repositories/delivery-assignment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAssignmentEntity])],
  controllers: [DeliveryAssignmentsController],
  providers: [DeliveryAssignmentsService, DeliveryAssignmentRepository],
  exports: [],
})
export class DeliveryAssignmentsModule {}
