import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { CreatePromotionApplicationDto } from '../dto/promotion-applications/create-promotion-application.dto';
import { PromotionApplicationQueryDto } from '../dto/promotion-applications/promotion-application-query.dto';
import { PromotionApplicationResponseDto } from '../dto/promotion-applications/promotion-application-response.dto';

@Injectable()
export class PromotionApplicationsService {
  findAll(
    _tenant: TenantContext,
    _query: PromotionApplicationQueryDto,
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
