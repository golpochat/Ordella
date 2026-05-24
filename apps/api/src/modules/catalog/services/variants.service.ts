import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto';
import { CreateVariantDto } from '../dto';
import { UpdateVariantDto } from '../dto';
import { VariantResponseDto } from '../dto';

@Injectable()
export class VariantsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<VariantResponseDto[]> {
    throw new NotImplementedException('findAll variants');
  }

  create(_tenant: TenantContext, _dto: CreateVariantDto): Promise<VariantResponseDto> {
    throw new NotImplementedException('create variant');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<VariantResponseDto> {
    throw new NotImplementedException('findOne variant');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateVariantDto): Promise<VariantResponseDto> {
    throw new NotImplementedException('update variant');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove variant');
  }
}
