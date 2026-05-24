import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreatePaymentDto } from '../dto/payments/create-payment.dto';
import { PaymentProviderResponseDto } from '../dto/payments/payment-provider-response.dto';
import { PaymentResponseDto } from '../dto/payments/payment-response.dto';
import { UpdatePaymentDto } from '../dto/payments/update-payment.dto';

@Injectable()
export class PaymentsService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<PaymentResponseDto[]> {
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
