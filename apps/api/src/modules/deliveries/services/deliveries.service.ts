import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateDeliveryDto } from '../dto/deliveries/create-delivery.dto';
import { DeliveryResponseDto } from '../dto/deliveries/delivery-response.dto';
import { DeliveryTrackingPointResponseDto } from '../dto/deliveries/delivery-tracking-point-response.dto';
import { UpdateDeliveryDto } from '../dto/deliveries/update-delivery.dto';
import { DeliveryStatusHistoryResponseDto } from '../dto/delivery-status-history/delivery-status-history-response.dto';

@Injectable()
export class DeliveriesService {
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
