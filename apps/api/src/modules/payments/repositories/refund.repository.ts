import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RefundEntity } from '../entities';
import { RefundStatus } from '../enums/refund-status.enum';

export interface CreateRefundParams {
  paymentId: string;
  amount: string;
  reason?: string | null;
  providerRefundId?: string | null;
}

@Injectable()
export class RefundRepository {
  constructor(
    @InjectRepository(RefundEntity)
    private readonly repository: Repository<RefundEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<RefundEntity> {
    return manager ? manager.getRepository(RefundEntity) : this.repository;
  }

  create(params: CreateRefundParams, manager?: EntityManager): Promise<RefundEntity> {
    const entry = this.repo(manager).create({
      paymentId: params.paymentId,
      amount: params.amount,
      reason: params.reason ?? null,
      status: RefundStatus.SUCCEEDED,
      providerRefundId: params.providerRefundId ?? null,
    });
    return this.repo(manager).save(entry);
  }

  async sumSucceededForPayment(paymentId: string, manager?: EntityManager): Promise<number> {
    const rows = await this.repo(manager).find({
      where: { paymentId, status: RefundStatus.SUCCEEDED },
    });
    return rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
  }

  findByIdForPayment(paymentId: string, refundId: string, manager?: EntityManager) {
    return this.repo(manager).findOne({ where: { id: refundId, paymentId } });
  }
}
