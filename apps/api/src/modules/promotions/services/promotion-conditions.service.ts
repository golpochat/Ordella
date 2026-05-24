import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { CreatePromotionConditionDto } from '../dto/promotion-conditions/create-promotion-condition.dto';
import { FilterPromotionConditionDto } from '../dto/promotion-conditions/filter-promotion-condition.dto';
import { PromotionConditionResponseDto } from '../dto/promotion-conditions/promotion-condition-response.dto';
import { UpdatePromotionConditionDto } from '../dto/promotion-conditions/update-promotion-condition.dto';

@Injectable()
export class PromotionConditionsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterPromotionConditionDto,
  ): Promise<PromotionConditionResponseDto[]> {
    throw new NotImplementedException('findAll promotion conditions');
  }

  create(
    _tenant: TenantContext,
    _dto: CreatePromotionConditionDto,
  ): Promise<PromotionConditionResponseDto> {
    throw new NotImplementedException('create promotion condition');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<PromotionConditionResponseDto> {
    throw new NotImplementedException('findOne promotion condition');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdatePromotionConditionDto,
  ): Promise<PromotionConditionResponseDto> {
    throw new NotImplementedException('update promotion condition');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove promotion condition');
  }
}
