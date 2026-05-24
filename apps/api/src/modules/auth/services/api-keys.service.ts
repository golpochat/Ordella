import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateApiKeyDto } from '../dto';
import { ApiKeyResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { TenantContext } from '../../../common/interfaces';

@Injectable()
export class ApiKeysService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<ApiKeyResponseDto[]> {
    throw new NotImplementedException('findAll api-keys');
  }

  create(_tenant: TenantContext, _dto: CreateApiKeyDto): Promise<ApiKeyResponseDto> {
    throw new NotImplementedException('create api-key');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove api-key');
  }
}
