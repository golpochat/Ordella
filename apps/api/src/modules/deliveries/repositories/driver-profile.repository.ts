import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DriverProfileEntity } from '../entities';

@Injectable()
export class DriverProfileRepository {
  constructor(
    @InjectRepository(DriverProfileEntity)
    private readonly repository: Repository<DriverProfileEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<DriverProfileEntity> {
    return manager ? manager.getRepository(DriverProfileEntity) : this.repository;
  }

  findByIdForTenant(
    tenantId: string,
    id: string,
    manager?: EntityManager,
    lock = false,
  ): Promise<DriverProfileEntity | null> {
    const qb = this.repo(manager)
      .createQueryBuilder('driver')
      .where('driver.id = :id', { id })
      .andWhere('driver.tenantId = :tenantId', { tenantId });

    if (lock) {
      qb.setLock('pessimistic_write');
    }

    return qb.getOne();
  }
}
