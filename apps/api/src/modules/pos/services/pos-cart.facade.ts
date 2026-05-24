import { Injectable } from '@nestjs/common';
import { CreatePosCartDto } from '../dto/create-pos-cart.dto';
import { PatchPosCartItemsDto } from '../dto/patch-pos-cart-items.dto';
import { PosCartResponseDto } from '../dto/pos-cart-response.dto';
import { PosCartAction } from '../enums/pos-cart-action.enum';
import { throwPosCartNotFound, throwPosContextMismatch } from '../domain/pos-domain.errors';
import { CartService } from './cart.service';
import { PosCart } from '../types';

@Injectable()
export class PosCartFacade {
  constructor(private readonly cartService: CartService) {}

  createOrAddItem(tenantId: string, dto: CreatePosCartDto): PosCartResponseDto {
    if (dto.cartId) {
      const cart = this.cartService.getCart(tenantId, dto.cartId);
      this.assertContext(cart, dto);
      if (dto.item) {
        this.cartService.addItem(tenantId, cart.id, dto.item);
      }
      return this.toResponse(this.cartService.getCart(tenantId, cart.id));
    }

    const cart = this.cartService.createCart({
      tenantId,
      terminalId: dto.terminalId,
      cashierId: dto.cashierId,
      shiftId: dto.shiftId,
      locationId: dto.locationId,
    });

    if (dto.item) {
      this.cartService.addItem(tenantId, cart.id, dto.item);
    }

    return this.toResponse(this.cartService.getCart(tenantId, cart.id));
  }

  patchItems(tenantId: string, dto: PatchPosCartItemsDto): PosCartResponseDto {
    const cart = this.cartService.getCart(tenantId, dto.cartId);
    this.assertContext(cart, dto);

    switch (dto.action) {
      case PosCartAction.ADD:
        this.cartService.addItem(tenantId, dto.cartId, dto.item);
        break;
      case PosCartAction.REMOVE:
        this.cartService.removeItem(tenantId, dto.cartId, dto.item.productId, dto.item.variantId);
        break;
      case PosCartAction.UPDATE:
        this.cartService.updateQuantity(
          tenantId,
          dto.cartId,
          dto.item.productId,
          dto.item.quantity,
          dto.item.variantId,
        );
        break;
      default:
        throwPosCartNotFound(dto.cartId);
    }

    return this.toResponse(this.cartService.getCart(tenantId, dto.cartId));
  }

  private assertContext(
    cart: PosCart,
    dto: { terminalId: string; cashierId: string; shiftId: string },
  ): void {
    if (
      cart.terminalId !== dto.terminalId ||
      cart.cashierId !== dto.cashierId ||
      cart.shiftId !== dto.shiftId
    ) {
      throwPosContextMismatch();
    }
  }

  private toResponse(cart: PosCart): PosCartResponseDto {
    return {
      cartId: cart.id,
      terminalId: cart.terminalId,
      cashierId: cart.cashierId,
      shiftId: cart.shiftId,
      locationId: cart.locationId,
      items: cart.items,
      orderId: cart.orderId,
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
    };
  }
}
