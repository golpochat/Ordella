import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreatePromotionDto } from '../dto/promotions/create-promotion.dto';
import { PromotionResponseDto } from '../dto/promotions/promotion-response.dto';
import { UpdatePromotionDto } from '../dto/promotions/update-promotion.dto';

@Injectable()
export class PromotionsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<PromotionResponseDto[]> {
    throw new NotImplementedException('findAll promotions');
  }

  create(_tenant: TenantContext, _dto: CreatePromotionDto): Promise<PromotionResponseDto> {
    throw new NotImplementedException('create promotion');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<PromotionResponseDto> {
    throw new NotImplementedException('findOne promotion');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdatePromotionDto,
  ): Promise<PromotionResponseDto> {
    throw new NotImplementedException('update promotion');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove promotion');
  }
}
