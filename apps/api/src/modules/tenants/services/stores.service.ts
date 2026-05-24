import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { CreateStoreDto } from '../dto';
import { UpdateStoreDto } from '../dto';
import { StoreResponseDto } from '../dto';
import { FilterPaginationDto } from '../../../common/dto';

@Injectable()
export class StoresService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<StoreResponseDto[]> {
    throw new NotImplementedException('findAll stores');
  }

  create(_tenant: TenantContext, _dto: CreateStoreDto): Promise<StoreResponseDto> {
    throw new NotImplementedException('create store');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<StoreResponseDto> {
    throw new NotImplementedException('findOne store');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateStoreDto): Promise<StoreResponseDto> {
    throw new NotImplementedException('update store');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove store');
  }
}
