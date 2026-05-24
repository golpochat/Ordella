import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateTenantDto } from '../dto/tenants/create-tenant.dto';
import { UpdateTenantDto } from '../dto/tenants/update-tenant.dto';
import { TenantResponseDto } from '../dto/tenants/tenant-response.dto';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';

@Injectable()
export class TenantsService {
  findAll(_query: FilterPaginationDto): Promise<TenantResponseDto[]> {
    throw new NotImplementedException('findAll tenants');
  }

  create(_dto: CreateTenantDto): Promise<TenantResponseDto> {
    throw new NotImplementedException('create tenant');
  }

  findOne(_id: string): Promise<TenantResponseDto> {
    throw new NotImplementedException('findOne tenant');
  }

  update(_id: string, _dto: UpdateTenantDto): Promise<TenantResponseDto> {
    throw new NotImplementedException('update tenant');
  }

  remove(_id: string): Promise<void> {
    throw new NotImplementedException('remove tenant');
  }
}
