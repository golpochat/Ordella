import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto';
import { CreatePaymentMethodDto } from '../dto';
import { PaymentMethodResponseDto } from '../dto';
import { UpdatePaymentMethodDto } from '../dto';

@Injectable()
export class PaymentMethodsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterPaginationDto,
  ): Promise<PaymentMethodResponseDto[]> {
    throw new NotImplementedException('findAll payment methods');
  }

  create(
    _tenant: TenantContext,
    _dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    throw new NotImplementedException('create payment method');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<PaymentMethodResponseDto> {
    throw new NotImplementedException('findOne payment method');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    throw new NotImplementedException('update payment method');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove payment method');
  }
}
