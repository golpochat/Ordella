import { Injectable } from '@nestjs/common';
import { InventoryService } from '../../inventory/services/inventory.service';
import { AdjustStockDto } from '../../inventory/dto/inventory/adjust-stock.dto';
import { StockAdjustmentType } from '../../inventory/enums/stock-adjustment-type.enum';
import { throwAdminResourceNotFound } from '../domain/admin-domain.errors';
import {
  AdminInventoryRepository,
  AdminMovementListFilter,
  AdminStockListFilter,
} from '../repositories/admin-inventory.repository';
import { AdminCreateAdjustmentDto } from '../dto/admin-create-adjustment.dto';

@Injectable()
export class InventoryAdminService {
  constructor(
    private readonly inventoryRepository: AdminInventoryRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async listStockLevels(tenantId: string, filter: AdminStockListFilter) {
    const rows = await this.inventoryRepository.listStockLevels(tenantId, filter);
    return rows.map((row) => AdminInventoryRepository.toStockView(row));
  }

  listMovements(tenantId: string, filter: AdminMovementListFilter) {
    return this.inventoryRepository.listMovements(tenantId, filter);
  }

  adjustStock(tenantId: string, dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(tenantId, dto);
  }

  async createAdjustment(tenantId: string, dto: AdminCreateAdjustmentDto) {
    const stockItem = await this.inventoryRepository.findStockItem(tenantId, dto.stockItemId);
    if (!stockItem) {
      throwAdminResourceNotFound('stockItem', dto.stockItemId);
    }

    const adjustDto: AdjustStockDto = {
      stockItemId: dto.stockItemId,
      locationId: dto.locationId,
      type: this.mapAdjustmentType(dto.kind),
      delta: dto.delta,
      reason: dto.reason,
      userId: dto.userId,
    };

    return this.inventoryService.adjustStock(tenantId, adjustDto);
  }

  private mapAdjustmentType(kind: AdminCreateAdjustmentDto['kind']): StockAdjustmentType {
    switch (kind) {
      case 'wastage':
        return StockAdjustmentType.DAMAGE;
      case 'correction':
        return StockAdjustmentType.CORRECTION;
      default:
        return StockAdjustmentType.MANUAL;
    }
  }
}
