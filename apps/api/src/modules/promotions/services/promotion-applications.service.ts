import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { CreatePromotionApplicationDto } from '../dto';
import { FilterPromotionApplicationDto } from '../dto';
import { PromotionApplicationResponseDto } from '../dto';

@Injectable()
export class PromotionApplicationsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterPromotionApplicationDto,
  ): Promise<PromotionApplicationResponseDto[]> {
    throw new NotImplementedException('findAll promotion applications');
  }

  create(
    _tenant: TenantContext,
    _dto: CreatePromotionApplicationDto,
  ): Promise<PromotionApplicationResponseDto> {
    throw new NotImplementedException('create promotion application');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<PromotionApplicationResponseDto> {
    throw new NotImplementedException('findOne promotion application');
  }
}
