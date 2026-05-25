import { Injectable } from '@nestjs/common';
import { CreateOnlineBasketDto } from '../dto/create-online-basket.dto';
import { PatchOnlineBasketItemsDto } from '../dto/patch-online-basket-items.dto';
import { OnlineBasketResponseDto } from '../dto/online-basket-response.dto';
import { OnlineBasketAction } from '../enums/online-basket-action.enum';
import { throwOnlineBasketNotFound, throwOnlineInvalidQuantity } from '../domain/online-domain.errors';
import { BasketService } from './basket.service';
import { OnlineBasket } from '../types';

@Injectable()
export class OnlineBasketFacade {
  constructor(private readonly basketService: BasketService) {}

  createOrAddItem(tenantId: string, dto: CreateOnlineBasketDto): OnlineBasketResponseDto {
    if (dto.sessionId) {
      const basket = this.basketService.getBasket(tenantId, dto.sessionId);
      if (dto.item) {
        this.basketService.addItem(dto.sessionId, this.requireProductId(dto), dto.item.quantity, {
          variantId: dto.item.variantId,
          bundleId: dto.item.bundleId,
          selectedBundleItemIds: dto.item.selectedBundleItemIds,
          modifierOptionIds: dto.item.modifierOptionIds,
          notes: dto.item.notes,
        });
      }
      return this.toResponse(this.basketService.getBasket(tenantId, basket.sessionId));
    }

    const basket = this.basketService.createBasket({
      tenantId,
      locationId: dto.locationId,
    });

    if (dto.item) {
      this.basketService.addItem(basket.sessionId, this.requireProductId(dto), dto.item.quantity, {
        variantId: dto.item.variantId,
        bundleId: dto.item.bundleId,
        selectedBundleItemIds: dto.item.selectedBundleItemIds,
        modifierOptionIds: dto.item.modifierOptionIds,
        notes: dto.item.notes,
      });
    }

    return this.toResponse(this.basketService.getBasket(tenantId, basket.sessionId));
  }

  patchItems(tenantId: string, dto: PatchOnlineBasketItemsDto): OnlineBasketResponseDto {
    this.basketService.getBasket(tenantId, dto.sessionId);

    switch (dto.action) {
      case OnlineBasketAction.ADD:
        this.basketService.addItem(dto.sessionId, this.requireProductId(dto), dto.item.quantity, {
          variantId: dto.item.variantId,
          bundleId: dto.item.bundleId,
          selectedBundleItemIds: dto.item.selectedBundleItemIds,
          modifierOptionIds: dto.item.modifierOptionIds,
          notes: dto.item.notes,
        });
        break;
      case OnlineBasketAction.REMOVE:
        this.basketService.removeItem(dto.sessionId, this.requireItemId(dto));
        break;
      case OnlineBasketAction.UPDATE:
        this.basketService.updateItem(
          dto.sessionId,
          this.requireItemId(dto),
          dto.item.quantity,
        );
        break;
      default:
        throwOnlineBasketNotFound(dto.sessionId);
    }

    return this.toResponse(this.basketService.getBasket(tenantId, dto.sessionId));
  }

  getBasket(tenantId: string, sessionId: string): OnlineBasketResponseDto {
    return this.toResponse(this.basketService.getBasket(tenantId, sessionId));
  }

  private requireProductId(
    dto: CreateOnlineBasketDto | PatchOnlineBasketItemsDto,
  ): string {
    if (!dto.item?.productId) {
      throwOnlineInvalidQuantity();
    }
    return dto.item.productId;
  }

  private requireItemId(dto: PatchOnlineBasketItemsDto): string {
    if (!dto.item.itemId) {
      throwOnlineBasketNotFound(dto.sessionId);
    }
    return dto.item.itemId;
  }

  private toResponse(basket: OnlineBasket): OnlineBasketResponseDto {
    return {
      sessionId: basket.sessionId,
      locationId: basket.locationId,
      items: basket.items,
      couponCode: basket.couponCode,
      orderId: basket.orderId,
      createdAt: basket.createdAt.toISOString(),
      updatedAt: basket.updatedAt.toISOString(),
    };
  }
}
