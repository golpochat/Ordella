import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateProductDto } from '../dto/products/create-product.dto';
import { UpdateProductDto } from '../dto/products/update-product.dto';
import { ProductResponseDto } from '../dto/products/product-response.dto';

@Injectable()
export class ProductsService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<ProductResponseDto[]> {
    throw new NotImplementedException('findAll products');
  }

  create(_tenant: TenantContext, _dto: CreateProductDto): Promise<ProductResponseDto> {
    throw new NotImplementedException('create product');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<ProductResponseDto> {
    throw new NotImplementedException('findOne product');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateProductDto): Promise<ProductResponseDto> {
    throw new NotImplementedException('update product');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove product');
  }
}
