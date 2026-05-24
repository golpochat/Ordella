import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateAddonDto } from '../dto/addons/create-addon.dto';
import { UpdateAddonDto } from '../dto/addons/update-addon.dto';
import { AddonResponseDto } from '../dto/addons/addon-response.dto';

@Injectable()
export class AddonsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<AddonResponseDto[]> {
    throw new NotImplementedException('findAll addons');
  }

  create(_tenant: TenantContext, _dto: CreateAddonDto): Promise<AddonResponseDto> {
    throw new NotImplementedException('create addon');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<AddonResponseDto> {
    throw new NotImplementedException('findOne addon');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateAddonDto): Promise<AddonResponseDto> {
    throw new NotImplementedException('update addon');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove addon');
  }
}
