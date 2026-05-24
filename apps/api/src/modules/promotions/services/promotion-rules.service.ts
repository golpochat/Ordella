import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { CreatePromotionRuleDto } from '../dto/promotion-rules/create-promotion-rule.dto';
import { PromotionRuleQueryDto } from '../dto/promotion-rules/promotion-rule-query.dto';
import { PromotionRuleResponseDto } from '../dto/promotion-rules/promotion-rule-response.dto';
import { UpdatePromotionRuleDto } from '../dto/promotion-rules/update-promotion-rule.dto';

@Injectable()
export class PromotionRulesService {
  findAll(
    _tenant: TenantContext,
    _query: PromotionRuleQueryDto,
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
