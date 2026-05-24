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
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { FilterPaginationDto } from '../../../common/dto';
import { PaymentsPermissionKeys } from '../constants/permission-keys';
import { CreatePaymentDto } from '../dto';
import { PaymentProviderResponseDto } from '../dto';
import { PaymentResponseDto } from '../dto';
import { UpdatePaymentDto } from '../dto';
import { PaymentsCrudService } from '../services/payments-crud.service';

/** API Spec §6.1, §6.3 */
@Controller('payments')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsCrudService) {}

  @Get()
  @RequirePermissions(PaymentsPermissionKeys.PAYMENTS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<PaymentResponseDto[]>> {
    const data = await this.paymentsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(PaymentsPermissionKeys.PAYMENTS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreatePaymentDto,
  ): Promise<ApiSuccessResponse<PaymentResponseDto>> {
    const data = await this.paymentsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get('providers')
  @RequirePermissions(PaymentsPermissionKeys.PAYMENTS_READ)
  async listProviders(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<PaymentProviderResponseDto[]>> {
    const data = await this.paymentsService.listProviders(tenant);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(PaymentsPermissionKeys.PAYMENTS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<PaymentResponseDto>> {
    const data = await this.paymentsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(PaymentsPermissionKeys.PAYMENTS_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentDto,
  ): Promise<ApiSuccessResponse<PaymentResponseDto>> {
    const data = await this.paymentsService.update(tenant, id, dto);
    return { success: true, data };
  }
}
