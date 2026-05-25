import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  throwOnlineBasketEmpty,
  throwOnlineBasketNotFound,
  throwOnlineBasketTenantMismatch,
  throwOnlineInvalidQuantity,
} from '../domain/online-domain.errors';
import { OnlineBasket, OnlineBasketLine } from '../types';

export interface OnlineBasketSessionContext {
  tenantId: string;
  locationId: string;
}

@Injectable()
export class BasketService {
  private readonly baskets = new Map<string, OnlineBasket>();

  createBasket(context: OnlineBasketSessionContext): OnlineBasket {
    const now = new Date();
    const basket: OnlineBasket = {
      sessionId: randomUUID(),
      tenantId: context.tenantId,
      locationId: context.locationId,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    this.baskets.set(basket.sessionId, basket);
    return basket;
  }

  getBasket(tenantId: string, sessionId: string): OnlineBasket {
    const basket = this.baskets.get(sessionId);
    if (!basket) {
      throwOnlineBasketNotFound(sessionId);
    }
    if (basket.tenantId !== tenantId) {
      throwOnlineBasketTenantMismatch(sessionId);
    }
    return basket;
  }

  addItem(
    sessionId: string,
    productId: string,
    quantity: number,
    modifiers?: {
      variantId?: string;
      bundleId?: string;
      selectedBundleItemIds?: string[];
      modifierOptionIds?: string[];
      notes?: string;
    },
  ): OnlineBasket {
    const basket = this.baskets.get(sessionId);
    if (!basket) {
      throwOnlineBasketNotFound(sessionId);
    }
    if (quantity < 1) {
      throwOnlineInvalidQuantity();
    }

    const line: OnlineBasketLine = {
      id: randomUUID(),
      productId,
      variantId: modifiers?.variantId,
      bundleId: modifiers?.bundleId,
      selectedBundleItemIds: modifiers?.selectedBundleItemIds,
      quantity,
      modifierOptionIds: modifiers?.modifierOptionIds,
      notes: modifiers?.notes,
    };
    basket.items.push(line);
    basket.updatedAt = new Date();
    basket.checkout = undefined;
    return basket;
  }

  updateItem(sessionId: string, itemId: string, quantity: number): OnlineBasket {
    const basket = this.baskets.get(sessionId);
    if (!basket) {
      throwOnlineBasketNotFound(sessionId);
    }
    if (quantity < 1) {
      throwOnlineInvalidQuantity();
    }

    const line = basket.items.find((item) => item.id === itemId);
    if (line) {
      line.quantity = quantity;
      basket.updatedAt = new Date();
      basket.checkout = undefined;
    }
    return basket;
  }

  removeItem(sessionId: string, itemId: string): OnlineBasket {
    const basket = this.baskets.get(sessionId);
    if (!basket) {
      throwOnlineBasketNotFound(sessionId);
    }

    basket.items = basket.items.filter((item) => item.id !== itemId);
    basket.updatedAt = new Date();
    basket.checkout = undefined;
    return basket;
  }

  clearBasket(sessionId: string): void {
    const basket = this.baskets.get(sessionId);
    if (!basket) {
      throwOnlineBasketNotFound(sessionId);
    }
    basket.items = [];
    basket.checkout = undefined;
    basket.updatedAt = new Date();
  }

  assertBasketHasItems(basket: OnlineBasket): void {
    if (!basket.items.length) {
      throwOnlineBasketEmpty(basket.sessionId);
    }
  }

  setCheckout(basket: OnlineBasket, checkout: NonNullable<OnlineBasket['checkout']>): OnlineBasket {
    basket.checkout = checkout;
    basket.updatedAt = new Date();
    return basket;
  }

  linkOrder(sessionId: string, orderId: string): OnlineBasket {
    const basket = this.baskets.get(sessionId);
    if (!basket) {
      throwOnlineBasketNotFound(sessionId);
    }
    basket.orderId = orderId;
    basket.updatedAt = new Date();
    return basket;
  }

  setCouponCode(sessionId: string, couponCode?: string): OnlineBasket {
    const basket = this.baskets.get(sessionId);
    if (!basket) {
      throwOnlineBasketNotFound(sessionId);
    }
    basket.couponCode = couponCode?.trim() || undefined;
    basket.checkout = undefined;
    basket.updatedAt = new Date();
    return basket;
  }
}
