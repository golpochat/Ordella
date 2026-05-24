import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PaymentAttemptEntity } from '../entities';
import { PaymentAttemptStatus } from '../enums/payment-attempt-status.enum';

export interface AppendAttemptParams {
  paymentId: string;
  attemptNumber: number;
  status: PaymentAttemptStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
  providerResponse?: Record<string, unknown>;
}

@Injectable()
export class PaymentAttemptRepository {
  constructor(
    @InjectRepository(PaymentAttemptEntity)
    private readonly repository: Repository<PaymentAttemptEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<PaymentAttemptEntity> {
    return manager ? manager.getRepository(PaymentAttemptEntity) : this.repository;
  }

  countForPayment(paymentId: string, manager?: EntityManager): Promise<number> {
    return this.repo(manager).count({ where: { paymentId } });
  }

  append(params: AppendAttemptParams, manager?: EntityManager): Promise<PaymentAttemptEntity> {
    const entry = this.repo(manager).create({
      paymentId: params.paymentId,
      attemptNumber: params.attemptNumber,
      status: params.status,
      errorCode: params.errorCode ?? null,
      errorMessage: params.errorMessage ?? null,
      providerResponse: params.providerResponse ?? {},
    });
    return this.repo(manager).save(entry);
  }

  findLatestForPayment(
    paymentId: string,
    manager?: EntityManager,
  ): Promise<PaymentAttemptEntity | null> {
    return this.repo(manager).findOne({
      where: { paymentId },
      order: { createdAt: 'DESC' },
    });
  }
}
