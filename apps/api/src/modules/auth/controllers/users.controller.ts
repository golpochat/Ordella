import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { CreateUserDto } from '../dto/users/create-user.dto';
import { UpdateUserDto } from '../dto/users/update-user.dto';
import { UserResponseDto } from '../dto/users/user-response.dto';
import { FilterPaginationDto } from '../dto/filter-pagination.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<UserResponseDto[]>> {
    const data = await this.usersService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('users:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateUserDto,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    const data = await this.usersService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('users:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    const data = await this.usersService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    const data = await this.usersService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.usersService.remove(tenant, id);
    return { success: true, data: null };
  }
}
