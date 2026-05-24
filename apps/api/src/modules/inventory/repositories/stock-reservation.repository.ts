import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { StockReservationEntity } from '../entities';
import { StockReservationStatus } from '../enums/stock-reservation-status.enum';
import { StockReferenceType } from '../enums/stock-reference-type.enum';

export interface CreateReservationParams {
  tenantId: string;
  stockItemId: string;
  locationId: string;
  quantity: string;
  referenceType: StockReferenceType;
  referenceId: string;
}

@Injectable()
export class StockReservationRepository {
  constructor(
    @InjectRepository(StockReservationEntity)
    private readonly repository: Repository<StockReservationEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<StockReservationEntity> {
    return manager ? manager.getRepository(StockReservationEntity) : this.repository;
  }

  create(
    params: CreateReservationParams,
    manager?: EntityManager,
  ): Promise<StockReservationEntity> {
    const entry = this.repo(manager).create({
      tenantId: params.tenantId,
      stockItemId: params.stockItemId,
      locationId: params.locationId,
      quantity: params.quantity,
      status: StockReservationStatus.ACTIVE,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
    });
    return this.repo(manager).save(entry);
  }

  findActiveForOrder(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
  ): Promise<StockReservationEntity[]> {
    return this.repo(manager).find({
      where: {
        tenantId,
        referenceType: StockReferenceType.ORDER,
        referenceId: orderId,
        status: StockReservationStatus.ACTIVE,
      },
    });
  }

  findActiveForOrderAndProduct(
    tenantId: string,
    orderId: string,
    stockItemId: string,
    manager?: EntityManager,
  ): Promise<StockReservationEntity | null> {
    return this.repo(manager).findOne({
      where: {
        tenantId,
        stockItemId,
        referenceType: StockReferenceType.ORDER,
        referenceId: orderId,
        status: StockReservationStatus.ACTIVE,
      },
    });
  }

  async releaseActiveForOrder(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
  ): Promise<StockReservationEntity[]> {
    const active = await this.findActiveForOrder(tenantId, orderId, manager);
    if (active.length === 0) {
      return [];
    }

    const ids = active.map((row) => row.id);
    await this.repo(manager).update(
      { id: In(ids), tenantId },
      { status: StockReservationStatus.RELEASED },
    );

    return active;
  }

  async fulfillActiveForOrder(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
  ): Promise<StockReservationEntity[]> {
    const active = await this.findActiveForOrder(tenantId, orderId, manager);
    if (active.length === 0) {
      return [];
    }

    const ids = active.map((row) => row.id);
    await this.repo(manager).update(
      { id: In(ids), tenantId },
      { status: StockReservationStatus.CONSUMED },
    );

    return active;
  }
}
