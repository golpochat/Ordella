import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateUserDto } from '../dto';
import { UpdateUserDto } from '../dto';
import { UserResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';

@Injectable()
export class UsersService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<UserResponseDto[]> {
    throw new NotImplementedException('findAll users');
  }

  create(_tenant: TenantContext, _dto: CreateUserDto): Promise<UserResponseDto> {
    throw new NotImplementedException('create user');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<UserResponseDto> {
    throw new NotImplementedException('findOne user');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateUserDto): Promise<UserResponseDto> {
    throw new NotImplementedException('update user');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove user');
  }
}
