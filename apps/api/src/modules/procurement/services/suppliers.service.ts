import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertSupplierDto } from '../dto';
import { SupplierEntity, SupplierItemEntity } from '../entities';
import { SearchIndexService } from '../../search';
import { hashPassword } from '../../onboarding/utils/password.util';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly suppliers: Repository<SupplierEntity>,
    @InjectRepository(SupplierItemEntity)
    private readonly supplierItems: Repository<SupplierItemEntity>,
    private readonly searchIndex: SearchIndexService,
  ) {}

  list(tenantId: string) {
    return this.suppliers.find({
      where: { tenantId },
      relations: { items: { item: true } },
      order: { name: 'ASC' },
    });
  }

  async get(tenantId: string, id: string) {
    const supplier = await this.suppliers.findOne({
      where: { tenantId, id },
      relations: { items: { item: true } },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(tenantId: string, dto: UpsertSupplierDto) {
    const supplier = await this.suppliers.save(this.suppliers.create({
      tenantId,
      name: dto.name,
      contactName: dto.contactName ?? null,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      notes: dto.notes ?? null,
      portalUserEmail: dto.portalUserEmail ? this.normalizeEmail(dto.portalUserEmail) : null,
      portalPasswordHash: dto.portalPassword ? await hashPassword(dto.portalPassword) : null,
      isActive: dto.isActive ?? true,
    }));
    await this.replaceItems(supplier.id, dto.items ?? []);
    const saved = await this.get(tenantId, supplier.id);
    await this.searchIndex.indexSupplier(saved);
    return saved;
  }

  async update(tenantId: string, dto: UpsertSupplierDto) {
    if (!dto.id) throw new NotFoundException('Supplier not found');
    const supplier = await this.get(tenantId, dto.id);
    supplier.name = dto.name ?? supplier.name;
    supplier.contactName = dto.contactName ?? null;
    supplier.email = dto.email ?? null;
    supplier.phone = dto.phone ?? null;
    supplier.address = dto.address ?? null;
    supplier.notes = dto.notes ?? null;
    supplier.portalUserEmail = dto.portalUserEmail !== undefined
      ? this.normalizeEmail(dto.portalUserEmail)
      : supplier.portalUserEmail;
    if (dto.portalPassword) {
      supplier.portalPasswordHash = await hashPassword(dto.portalPassword);
    }
    supplier.isActive = dto.isActive ?? supplier.isActive;
    await this.suppliers.save(supplier);
    if (dto.items) {
      await this.replaceItems(supplier.id, dto.items);
    }
    const saved = await this.get(tenantId, supplier.id);
    await this.searchIndex.indexSupplier(saved);
    return saved;
  }

  async disable(tenantId: string, id: string) {
    const supplier = await this.get(tenantId, id);
    supplier.isActive = false;
    await this.suppliers.save(supplier);
    const saved = await this.get(tenantId, id);
    await this.searchIndex.indexSupplier(saved);
    return saved;
  }

  private async replaceItems(supplierId: string, items: NonNullable<UpsertSupplierDto['items']>) {
    await this.supplierItems.delete({ supplierId });
    if (!items.length) return;
    await this.supplierItems.save(items.map((item) => this.supplierItems.create({
      supplierId,
      itemId: item.itemId,
      costPrice: item.costPrice.toFixed(2),
      sku: item.sku ?? null,
      leadTimeDays: item.leadTimeDays ?? 0,
      minOrderQty: item.minOrderQty ?? 1,
      caseSize: item.caseSize ?? 1,
    })));
  }

  private normalizeEmail(email?: string | null): string | null {
    const normalized = email?.trim().toLowerCase();
    return normalized || null;
  }
}
