import { Injectable, NotImplementedException } from '@nestjs/common';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateIntegrationProviderDto } from '../dto/integration-providers/create-integration-provider.dto';
import { IntegrationProviderResponseDto } from '../dto/integration-providers/integration-provider-response.dto';
import { UpdateIntegrationProviderDto } from '../dto/integration-providers/update-integration-provider.dto';

@Injectable()
export class IntegrationProvidersService {
  findAll(_query: PaginationQueryDto): Promise<IntegrationProviderResponseDto[]> {
    throw new NotImplementedException('findAll integration providers');
  }

  create(_dto: CreateIntegrationProviderDto): Promise<IntegrationProviderResponseDto> {
    throw new NotImplementedException('create integration provider');
  }

  findOne(_id: string): Promise<IntegrationProviderResponseDto> {
    throw new NotImplementedException('findOne integration provider');
  }

  update(
    _id: string,
    _dto: UpdateIntegrationProviderDto,
  ): Promise<IntegrationProviderResponseDto> {
    throw new NotImplementedException('update integration provider');
  }
}
