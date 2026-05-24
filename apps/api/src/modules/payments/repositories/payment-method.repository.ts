import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethodEntity } from '../entities';

@Injectable()
export class PaymentMethodRepository {
  constructor(
    @InjectRepository(PaymentMethodEntity)
    private readonly repository: Repository<PaymentMethodEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create, update, softDelete
}
