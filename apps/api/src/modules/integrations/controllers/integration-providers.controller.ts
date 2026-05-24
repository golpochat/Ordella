import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { IntegrationsPermissionKeys } from '../constants/permission-keys';
import { CreateIntegrationProviderDto } from '../dto/integration-providers/create-integration-provider.dto';
import { IntegrationProviderResponseDto } from '../dto/integration-providers/integration-provider-response.dto';
import { UpdateIntegrationProviderDto } from '../dto/integration-providers/update-integration-provider.dto';
import { IntegrationProvidersService } from '../services/integration-providers.service';

/** Platform provider catalog */
@Controller('integration-providers')
@UseGuards(JwtAuthGuard, RbacGuard)
export class IntegrationProvidersController {
  constructor(private readonly integrationProvidersService: IntegrationProvidersService) {}

  @Get()
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_PROVIDERS_READ)
  async findAll(
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<IntegrationProviderResponseDto[]>> {
    const data = await this.integrationProvidersService.findAll(query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_PROVIDERS_CREATE)
  async create(
    @Body() dto: CreateIntegrationProviderDto,
  ): Promise<ApiSuccessResponse<IntegrationProviderResponseDto>> {
    const data = await this.integrationProvidersService.create(dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_PROVIDERS_READ)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<IntegrationProviderResponseDto>> {
    const data = await this.integrationProvidersService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_PROVIDERS_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIntegrationProviderDto,
  ): Promise<ApiSuccessResponse<IntegrationProviderResponseDto>> {
    const data = await this.integrationProvidersService.update(id, dto);
    return { success: true, data };
  }
}
