import { Injectable, NotImplementedException } from '@nestjs/common';
import { FilterPaginationDto } from '../../auth/dto';
import { CreateIntegrationProviderDto } from '../dto';
import { IntegrationProviderResponseDto } from '../dto';
import { UpdateIntegrationProviderDto } from '../dto';

@Injectable()
export class IntegrationProvidersService {
  findAll(_query: FilterPaginationDto): Promise<IntegrationProviderResponseDto[]> {
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
