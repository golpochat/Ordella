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

  findAllForTenant(tenantId: string): Promise<DriverProfileEntity[]> {
    return this.repository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  findByUserIdForTenant(
    tenantId: string,
    userId: string,
  ): Promise<DriverProfileEntity | null> {
    return this.repository.findOne({ where: { tenantId, userId } });
  }

  save(driver: DriverProfileEntity, manager?: EntityManager): Promise<DriverProfileEntity> {
    return this.repo(manager).save(driver);
  }

  createForTenant(
    tenantId: string,
    dto: { name: string; phone: string; userId?: string; status?: string; vehicleType?: string },
    manager?: EntityManager,
  ): Promise<DriverProfileEntity> {
    const driver = this.repo(manager).create({
      tenantId,
      name: dto.name,
      phone: dto.phone,
      userId: dto.userId ?? null,
      vehicleType: dto.vehicleType ?? null,
      active: true,
    });
    return this.repo(manager).save(driver);
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
