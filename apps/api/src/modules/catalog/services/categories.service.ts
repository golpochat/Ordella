import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateCategoryDto } from '../dto/categories/create-category.dto';
import { UpdateCategoryDto } from '../dto/categories/update-category.dto';
import { CategoryResponseDto } from '../dto/categories/category-response.dto';

@Injectable()
export class CategoriesService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<CategoryResponseDto[]> {
    throw new NotImplementedException('findAll categories');
  }

  create(_tenant: TenantContext, _dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    throw new NotImplementedException('create category');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<CategoryResponseDto> {
    throw new NotImplementedException('findOne category');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    throw new NotImplementedException('update category');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove category');
  }
}
