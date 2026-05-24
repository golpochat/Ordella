import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreatePaymentDto } from '../dto';
import { PaymentProviderResponseDto } from '../dto';
import { PaymentResponseDto } from '../dto';
import { UpdatePaymentDto } from '../dto';

/** REST CRUD for /payments — domain orchestration lives in PaymentsService. */
@Injectable()
export class PaymentsCrudService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<PaymentResponseDto[]> {
    throw new NotImplementedException('findAll payments');
  }

  create(_tenant: TenantContext, _dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    throw new NotImplementedException('create payment');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<PaymentResponseDto> {
    throw new NotImplementedException('findOne payment');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    throw new NotImplementedException('update payment');
  }

  listProviders(_tenant: TenantContext): Promise<PaymentProviderResponseDto[]> {
    throw new NotImplementedException('list payment providers');
  }
}
