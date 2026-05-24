import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateUserDto } from '../dto/users/create-user.dto';
import { UpdateUserDto } from '../dto/users/update-user.dto';
import { UserResponseDto } from '../dto/users/user-response.dto';
import { FilterPaginationDto } from '../dto/filter-pagination.dto';
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
