import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterDeliveryAssignmentDto } from '../dto/delivery-assignments/filter-delivery-assignment.dto';
import { DeliveryAssignmentResponseDto } from '../dto/delivery-assignments/delivery-assignment-response.dto';
import { CreateDeliveryAssignmentDto } from '../dto/delivery-assignments/create-delivery-assignment.dto';
import { UpdateDeliveryAssignmentDto } from '../dto/delivery-assignments/update-delivery-assignment.dto';

@Injectable()
export class DeliveryAssignmentsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterDeliveryAssignmentDto,
  ): Promise<DeliveryAssignmentResponseDto[]> {
    throw new NotImplementedException('findAll delivery assignments');
  }

  create(
    _tenant: TenantContext,
    _dto: CreateDeliveryAssignmentDto,
  ): Promise<DeliveryAssignmentResponseDto> {
    throw new NotImplementedException('create delivery assignment');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<DeliveryAssignmentResponseDto> {
    throw new NotImplementedException('findOne delivery assignment');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateDeliveryAssignmentDto,
  ): Promise<DeliveryAssignmentResponseDto> {
    throw new NotImplementedException('update delivery assignment');
  }
}
