import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto';
import { CreateCategoryDto } from '../dto';
import { UpdateCategoryDto } from '../dto';
import { CategoryResponseDto } from '../dto';

@Injectable()
export class CategoriesService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<CategoryResponseDto[]> {
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
