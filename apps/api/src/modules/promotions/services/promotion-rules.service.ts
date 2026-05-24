import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { CreatePromotionRuleDto } from '../dto';
import { FilterPromotionRuleDto } from '../dto';
import { PromotionRuleResponseDto } from '../dto';
import { UpdatePromotionRuleDto } from '../dto';

@Injectable()
export class PromotionRulesService {
  findAll(
    _tenant: TenantContext,
    _query: FilterPromotionRuleDto,
  ): Promise<PromotionRuleResponseDto[]> {
    throw new NotImplementedException('findAll promotion rules');
  }

  create(_tenant: TenantContext, _dto: CreatePromotionRuleDto): Promise<PromotionRuleResponseDto> {
    throw new NotImplementedException('create promotion rule');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<PromotionRuleResponseDto> {
    throw new NotImplementedException('findOne promotion rule');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdatePromotionRuleDto,
  ): Promise<PromotionRuleResponseDto> {
    throw new NotImplementedException('update promotion rule');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove promotion rule');
  }
}
