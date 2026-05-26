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
import { CurrentTenant } from '../../common/decorators';
import { TenantGuard } from '../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../common/interfaces';
import { CurrentCustomer } from './decorators/current-customer.decorator';
import {
  CompleteCustomerPasswordResetDto,
  CreateCustomerAddressDto,
  LoginCustomerDto,
  RegisterCustomerDto,
  ResetCustomerPasswordDto,
  SaveCustomerBasketDto,
  SaveCustomerItemDto,
  UpdateCustomerAddressDto,
  UpdateCustomerProfileDto,
  UpdateCustomerSavedBasketDto,
  VerifyCustomerEmailDto,
} from './dto';
import { CustomerAuthGuard } from './guards/customer-auth.guard';
import { CustomerAuthPayload } from './types/customer-auth-payload';
import { CustomerAccountsService } from './customer-accounts.service';

@Controller(['customer', 'public/customer'])
@UseGuards(TenantGuard)
export class CustomerAccountsController {
  constructor(private readonly customerAccounts: CustomerAccountsService) {}

  @Post('register')
  async register(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: RegisterCustomerDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.register(tenant, dto);
    return { success: true, data };
  }

  @Post('login')
  async login(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: LoginCustomerDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.login(tenant, dto);
    return { success: true, data };
  }

  @Post('otp/request')
  async requestOtp(): Promise<ApiSuccessResponse<{ sent: boolean }>> {
    return { success: true, data: { sent: false } };
  }

  @Post('logout')
  @UseGuards(CustomerAuthGuard)
  async logout(): Promise<ApiSuccessResponse<{ loggedOut: boolean }>> {
    return { success: true, data: { loggedOut: true } };
  }

  @Post('reset-password')
  async resetPassword(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: ResetCustomerPasswordDto,
  ): Promise<ApiSuccessResponse<{ requested: boolean }>> {
    await this.customerAccounts.requestPasswordReset(tenant, dto);
    return { success: true, data: { requested: true } };
  }

  @Post('reset-password/complete')
  async completePasswordReset(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CompleteCustomerPasswordResetDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.resetPassword(tenant, dto);
    return { success: true, data };
  }

  @Post('email-verification/request')
  @UseGuards(CustomerAuthGuard)
  async requestEmailVerification(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.requestEmailVerification(tenant, customer.sub);
    return { success: true, data };
  }

  @Post('email-verification/verify')
  async verifyEmail(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: VerifyCustomerEmailDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.verifyEmail(tenant, dto);
    return { success: true, data };
  }

  @Get('me')
  @UseGuards(CustomerAuthGuard)
  async me(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.getAccount(tenant, customer.sub);
    return { success: true, data };
  }

  @Get('profile')
  @UseGuards(CustomerAuthGuard)
  async profile(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.getAccount(tenant, customer.sub);
    return { success: true, data };
  }

  @Patch('profile')
  @UseGuards(CustomerAuthGuard)
  async patchProfile(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Body() dto: UpdateCustomerProfileDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.updateProfile(tenant, customer.sub, dto);
    return { success: true, data };
  }

  @Post('update-profile')
  @UseGuards(CustomerAuthGuard)
  async updateProfile(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Body() dto: UpdateCustomerProfileDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.updateProfile(tenant, customer.sub, dto);
    return { success: true, data };
  }

  @Get('addresses')
  @UseGuards(CustomerAuthGuard)
  async addresses(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.customerAccounts.listAddresses(tenant, customer.sub);
    return { success: true, data };
  }

  @Post('addresses')
  @UseGuards(CustomerAuthGuard)
  async createAddress(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Body() dto: CreateCustomerAddressDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.createAddress(tenant, customer.sub, dto);
    return { success: true, data };
  }

  @Patch('addresses/:addressId')
  @UseGuards(CustomerAuthGuard)
  async updateAddress(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() dto: UpdateCustomerAddressDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.updateAddress(tenant, customer.sub, addressId, dto);
    return { success: true, data };
  }

  @Delete('addresses/:addressId')
  @UseGuards(CustomerAuthGuard)
  async deleteAddress(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('addressId', ParseUUIDPipe) addressId: string,
  ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    await this.customerAccounts.deleteAddress(tenant, customer.sub, addressId);
    return { success: true, data: { deleted: true } };
  }

  @Get('orders')
  @UseGuards(CustomerAuthGuard)
  async orders(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Query('filter') filter?: 'active' | 'past',
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.customerAccounts.listOrders(tenant, customer.sub, filter);
    return { success: true, data };
  }

  @Get('orders/:orderId')
  @UseGuards(CustomerAuthGuard)
  async order(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.getOrder(tenant, customer.sub, orderId);
    return { success: true, data };
  }

  @Get('loyalty/history')
  @UseGuards(CustomerAuthGuard)
  async loyaltyHistory(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.customerAccounts.listLoyaltyHistory(tenant, customer.sub);
    return { success: true, data };
  }

  @Get('store-credit/history')
  @UseGuards(CustomerAuthGuard)
  async storeCreditHistory(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.customerAccounts.listStoreCreditHistory(tenant, customer.sub);
    return { success: true, data };
  }

  @Get('gift-cards')
  @UseGuards(CustomerAuthGuard)
  async giftCards(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.customerAccounts.listGiftCards(tenant, customer.sub);
    return { success: true, data };
  }

  @Post('gift-cards/redeem')
  @UseGuards(CustomerAuthGuard)
  async redeemGiftCard(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Body('code') code: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.linkGiftCard(tenant, customer.sub, code);
    return { success: true, data };
  }

  @Get('saved-baskets')
  @UseGuards(CustomerAuthGuard)
  async savedBaskets(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.customerAccounts.listSavedBaskets(tenant, customer.sub);
    return { success: true, data };
  }

  @Post('saved-baskets')
  @UseGuards(CustomerAuthGuard)
  async createSavedBasket(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Body() dto: SaveCustomerBasketDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.saveBasket(tenant, customer.sub, dto);
    return { success: true, data };
  }

  @Patch('saved-baskets/:basketId')
  @UseGuards(CustomerAuthGuard)
  async updateSavedBasket(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('basketId', ParseUUIDPipe) basketId: string,
    @Body() dto: UpdateCustomerSavedBasketDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.updateSavedBasket(tenant, customer.sub, basketId, dto);
    return { success: true, data };
  }

  @Delete('saved-baskets/:basketId')
  @UseGuards(CustomerAuthGuard)
  async deleteSavedBasket(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('basketId', ParseUUIDPipe) basketId: string,
  ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    await this.customerAccounts.deleteSavedBasket(tenant, customer.sub, basketId);
    return { success: true, data: { deleted: true } };
  }

  @Get('saved-items')
  @UseGuards(CustomerAuthGuard)
  async savedItems(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.customerAccounts.listSavedItems(tenant, customer.sub);
    return { success: true, data };
  }

  @Post('saved-items')
  @UseGuards(CustomerAuthGuard)
  async createSavedItem(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Body() dto: SaveCustomerItemDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.saveItem(tenant, customer.sub, dto);
    return { success: true, data };
  }

  @Delete('saved-items/:itemId')
  @UseGuards(CustomerAuthGuard)
  async deleteSavedItem(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    await this.customerAccounts.deleteSavedItem(tenant, customer.sub, itemId);
    return { success: true, data: { deleted: true } };
  }

  @Get('sessions')
  @UseGuards(CustomerAuthGuard)
  async sessions(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.customerAccounts.listSessions(tenant, customer.sub);
    return { success: true, data };
  }

  @Delete('sessions/:sessionId')
  @UseGuards(CustomerAuthGuard)
  async revokeSession(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<ApiSuccessResponse<{ revoked: boolean }>> {
    await this.customerAccounts.revokeSession(tenant, customer.sub, sessionId);
    return { success: true, data: { revoked: true } };
  }

  @Get('gdpr/export')
  @UseGuards(CustomerAuthGuard)
  async exportMyData(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.exportMyData(tenant, customer.sub);
    return { success: true, data };
  }

  @Delete('gdpr/delete')
  @UseGuards(CustomerAuthGuard)
  async deleteMyData(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.customerAccounts.deleteMyData(tenant, customer.sub);
    return { success: true, data };
  }
}
