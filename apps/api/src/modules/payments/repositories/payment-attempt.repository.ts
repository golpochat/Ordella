import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentAttemptEntity } from '../entities/payment-attempt.entity';

@Injectable()
export class PaymentAttemptRepository {
  constructor(
    @InjectRepository(PaymentAttemptEntity)
    private readonly repository: Repository<PaymentAttemptEntity>,
  ) {}

  // TODO: findAllByPaymentId, findById
}
