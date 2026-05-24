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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { PaymentsPermissionKeys } from '../constants/permission-keys';
import { CreatePaymentMethodDto } from '../dto/payment-methods/create-payment-method.dto';
import { PaymentMethodResponseDto } from '../dto/payment-methods/payment-method-response.dto';
import { UpdatePaymentMethodDto } from '../dto/payment-methods/update-payment-method.dto';
import { PaymentMethodsService } from '../services/payment-methods.service';

/** SRS §9 — saved / configured payment methods */
@Controller('payment-methods')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @RequirePermissions(PaymentsPermissionKeys.PAYMENT_METHODS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<PaymentMethodResponseDto[]>> {
    const data = await this.paymentMethodsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(PaymentsPermissionKeys.PAYMENT_METHODS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreatePaymentMethodDto,
  ): Promise<ApiSuccessResponse<PaymentMethodResponseDto>> {
    const data = await this.paymentMethodsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(PaymentsPermissionKeys.PAYMENT_METHODS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<PaymentMethodResponseDto>> {
    const data = await this.paymentMethodsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(PaymentsPermissionKeys.PAYMENT_METHODS_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ): Promise<ApiSuccessResponse<PaymentMethodResponseDto>> {
    const data = await this.paymentMethodsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions(PaymentsPermissionKeys.PAYMENT_METHODS_DELETE)
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.paymentMethodsService.remove(tenant, id);
    return { success: true, data: null };
  }
}
