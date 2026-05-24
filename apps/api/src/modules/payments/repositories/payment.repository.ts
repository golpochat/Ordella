import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PaymentEntity } from '../entities';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repository: Repository<PaymentEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<PaymentEntity> {
    return manager ? manager.getRepository(PaymentEntity) : this.repository;
  }

  findByIdForTenant(
    tenantId: string,
    id: string,
    manager?: EntityManager,
    lock = false,
  ): Promise<PaymentEntity | null> {
    const qb = this.repo(manager)
      .createQueryBuilder('payment')
      .where('payment.id = :id', { id })
      .andWhere('payment.tenantId = :tenantId', { tenantId });

    if (lock) {
      qb.setLock('pessimistic_write');
    }

    return qb.getOne();
  }

  findByOrderForTenant(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
    lock = false,
  ): Promise<PaymentEntity | null> {
    const qb = this.repo(manager)
      .createQueryBuilder('payment')
      .where('payment.tenantId = :tenantId', { tenantId })
      .andWhere('payment.orderId = :orderId', { orderId });

    if (lock) {
      qb.setLock('pessimistic_write');
    }

    return qb.getOne();
  }

  save(payment: PaymentEntity, manager?: EntityManager): Promise<PaymentEntity> {
    return this.repo(manager).save(payment);
  }

  create(partial: Partial<PaymentEntity>, manager?: EntityManager): PaymentEntity {
    return this.repo(manager).create(partial);
  }
}
