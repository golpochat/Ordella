import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateDeliveryDto } from '../dto';
import { DeliveryResponseDto } from '../dto';
import { DeliveryTrackingPointResponseDto } from '../dto';
import { UpdateDeliveryDto } from '../dto';
import { DeliveryStatusHistoryResponseDto } from '../dto';

@Injectable()
export class DeliveriesCrudService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<DeliveryResponseDto[]> {
    throw new NotImplementedException('findAll deliveries');
  }

  create(_tenant: TenantContext, _dto: CreateDeliveryDto): Promise<DeliveryResponseDto> {
    throw new NotImplementedException('create delivery');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<DeliveryResponseDto> {
    throw new NotImplementedException('findOne delivery');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    throw new NotImplementedException('update delivery');
  }

  getTracking(
    _tenant: TenantContext,
    _deliveryTaskId: string,
    _query: FilterPaginationDto,
  ): Promise<DeliveryTrackingPointResponseDto[]> {
    throw new NotImplementedException('get delivery tracking');
  }

  autoAssign(_tenant: TenantContext, _deliveryTaskId: string): Promise<DeliveryResponseDto> {
    throw new NotImplementedException('auto-assign delivery driver');
  }

  getStatusHistory(
    _tenant: TenantContext,
    _deliveryTaskId: string,
    _query: FilterPaginationDto,
  ): Promise<DeliveryStatusHistoryResponseDto[]> {
    throw new NotImplementedException('get delivery status history');
  }
}
