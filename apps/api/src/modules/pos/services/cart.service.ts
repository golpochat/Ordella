import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { cartLineKey, findCartLineIndex } from '../domain/pos-cart.util';
import {
  throwPosCartAlreadyCheckedOut,
  throwPosCartEmpty,
  throwPosCartNotFound,
  throwPosCartTenantMismatch,
  throwPosInvalidQuantity,
} from '../domain/pos-domain.errors';
import { PosCart, PosCartLine } from '../types';

export interface PosCartSessionContext {
  tenantId: string;
  terminalId: string;
  cashierId: string;
  shiftId: string;
  locationId: string;
}

@Injectable()
export class CartService {
  private readonly carts = new Map<string, PosCart>();

  createCart(context: PosCartSessionContext): PosCart {
    const now = new Date();
    const cart: PosCart = {
      id: randomUUID(),
      tenantId: context.tenantId,
      terminalId: context.terminalId,
      cashierId: context.cashierId,
      shiftId: context.shiftId,
      locationId: context.locationId,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    this.carts.set(cart.id, cart);
    return cart;
  }

  getCart(tenantId: string, cartId: string): PosCart {
    const cart = this.carts.get(cartId);
    if (!cart) {
      throwPosCartNotFound(cartId);
    }
    if (cart.tenantId !== tenantId) {
      throwPosCartTenantMismatch(cartId);
    }
    return cart;
  }

  addItem(tenantId: string, cartId: string, line: PosCartLine): PosCart {
    const cart = this.getCart(tenantId, cartId);
    this.assertCartEditable(cart);
    if (line.quantity < 1) {
      throwPosInvalidQuantity();
    }

    const key = cartLineKey(line);
    const index = findCartLineIndex(cart.items, key);
    if (index >= 0) {
      cart.items[index].quantity += line.quantity;
      if (line.notes !== undefined) {
        cart.items[index].notes = line.notes;
      }
      if (line.modifierOptionIds !== undefined) {
        cart.items[index].modifierOptionIds = line.modifierOptionIds;
      }
    } else {
      cart.items.push({ ...line });
    }

    cart.updatedAt = new Date();
    return cart;
  }

  removeItem(
    tenantId: string,
    cartId: string,
    productId: string,
    variantId?: string,
  ): PosCart {
    const cart = this.getCart(tenantId, cartId);
    this.assertCartEditable(cart);

    const key = cartLineKey({ productId, variantId });
    const index = findCartLineIndex(cart.items, key);
    if (index >= 0) {
      cart.items.splice(index, 1);
      cart.updatedAt = new Date();
    }

    return cart;
  }

  updateQuantity(
    tenantId: string,
    cartId: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ): PosCart {
    const cart = this.getCart(tenantId, cartId);
    this.assertCartEditable(cart);

    if (quantity < 1) {
      throwPosInvalidQuantity();
    }

    const key = cartLineKey({ productId, variantId });
    const index = findCartLineIndex(cart.items, key);
    if (index >= 0) {
      cart.items[index].quantity = quantity;
      cart.updatedAt = new Date();
    }

    return cart;
  }

  clearCart(tenantId: string, cartId: string): void {
    const cart = this.getCart(tenantId, cartId);
    cart.items = [];
    cart.updatedAt = new Date();
  }

  assertCartHasItems(cart: PosCart): void {
    if (!cart.items.length) {
      throwPosCartEmpty(cart.id);
    }
  }

  linkOrder(tenantId: string, cartId: string, orderId: string): PosCart {
    const cart = this.getCart(tenantId, cartId);
    cart.orderId = orderId;
    cart.updatedAt = new Date();
    return cart;
  }

  findByOrderId(tenantId: string, orderId: string): PosCart | undefined {
    for (const cart of this.carts.values()) {
      if (cart.tenantId === tenantId && cart.orderId === orderId) {
        return cart;
      }
    }
    return undefined;
  }

  deleteCart(tenantId: string, cartId: string): void {
    this.getCart(tenantId, cartId);
    this.carts.delete(cartId);
  }

  private assertCartEditable(cart: PosCart): void {
    if (cart.orderId) {
      throwPosCartAlreadyCheckedOut(cart.id);
    }
  }
}
