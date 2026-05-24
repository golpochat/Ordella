import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateIntegrationAppDto } from '../dto';
import { IntegrationAppResponseDto } from '../dto';
import { CreateIntegrationWebhookDto } from '../dto';
import { UpdateIntegrationDto } from '../dto';

@Injectable()
export class IntegrationsAppsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<IntegrationAppResponseDto[]> {
    throw new NotImplementedException('findAll integration apps');
  }

  connect(_tenant: TenantContext, _dto: CreateIntegrationAppDto): Promise<IntegrationAppResponseDto> {
    throw new NotImplementedException('connect integration app');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<IntegrationAppResponseDto> {
    throw new NotImplementedException('findOne integration app');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateIntegrationDto,
  ): Promise<IntegrationAppResponseDto> {
    throw new NotImplementedException('update integration app');
  }

  disconnect(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('disconnect integration app');
  }
}

@Injectable()
export class IntegrationsWebhooksService {
  receiveDeliveryWebhook(
    _tenant: TenantContext,
    _dto: CreateIntegrationWebhookDto,
  ): Promise<{ received: boolean }> {
    throw new NotImplementedException('receive delivery partner webhook');
  }

  receivePaymentsWebhook(
    _tenant: TenantContext,
    _dto: CreateIntegrationWebhookDto,
  ): Promise<{ received: boolean }> {
    throw new NotImplementedException('receive payment provider webhook');
  }

  receivePosWebhook(
    _tenant: TenantContext,
    _dto: CreateIntegrationWebhookDto,
  ): Promise<{ received: boolean }> {
    throw new NotImplementedException('receive POS webhook');
  }
}
