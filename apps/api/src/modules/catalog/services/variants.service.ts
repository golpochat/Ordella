import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateVariantDto } from '../dto/variants/create-variant.dto';
import { UpdateVariantDto } from '../dto/variants/update-variant.dto';
import { VariantResponseDto } from '../dto/variants/variant-response.dto';

@Injectable()
export class VariantsService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<VariantResponseDto[]> {
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
