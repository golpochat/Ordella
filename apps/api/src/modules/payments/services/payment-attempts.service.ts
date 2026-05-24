import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaymentAttemptDto } from '../dto/payment-attempts/filter-payment-attempt.dto';
import { PaymentAttemptResponseDto } from '../dto/payment-attempts/payment-attempt-response.dto';

@Injectable()
export class PaymentAttemptsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterPaymentAttemptDto,
  ): Promise<PaymentAttemptResponseDto[]> {
    throw new NotImplementedException('findAll payment attempts');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<PaymentAttemptResponseDto> {
    throw new NotImplementedException('findOne payment attempt');
  }
}
