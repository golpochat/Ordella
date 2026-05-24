import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateModifierDto } from '../dto/modifiers/create-modifier.dto';
import { UpdateModifierDto } from '../dto/modifiers/update-modifier.dto';
import { ModifierResponseDto } from '../dto/modifiers/modifier-response.dto';

@Injectable()
export class ModifiersService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<ModifierResponseDto[]> {
    throw new NotImplementedException('findAll modifiers');
  }

  create(_tenant: TenantContext, _dto: CreateModifierDto): Promise<ModifierResponseDto> {
    throw new NotImplementedException('create modifier');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<ModifierResponseDto> {
    throw new NotImplementedException('findOne modifier');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateModifierDto): Promise<ModifierResponseDto> {
    throw new NotImplementedException('update modifier');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove modifier');
  }
}
