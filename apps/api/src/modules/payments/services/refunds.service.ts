import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { CreateRefundDto } from '../dto';
import { RefundResponseDto } from '../dto';

@Injectable()
export class RefundsService {
  create(_tenant: TenantContext, _dto: CreateRefundDto): Promise<RefundResponseDto> {
    throw new NotImplementedException('create refund');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<RefundResponseDto> {
    throw new NotImplementedException('findOne refund');
  }
}
