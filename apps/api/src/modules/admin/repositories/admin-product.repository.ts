import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { ProductStatus } from '../../catalog/enums/product-status.enum';

export interface AdminProductListFilter {
  status?: ProductStatus;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  findAllForTenant(tenantId: string, filter: AdminProductListFilter): Promise<ProductEntity[]> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 50;

    return this.repository.find({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
        ...(filter.search ? { name: ILike(`%${filter.search}%`) } : {}),
      },
      order: { sortOrder: 'ASC', name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findByIdForTenant(tenantId: string, id: string): Promise<ProductEntity | null> {
    return this.repository.findOne({ where: { id, tenantId } });
  }

  create(partial: Partial<ProductEntity>): ProductEntity {
    return this.repository.create(partial);
  }

  save(product: ProductEntity): Promise<ProductEntity> {
    return this.repository.save(product);
  }
}
