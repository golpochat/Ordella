import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UpsertTaxRuleDto } from '../dto';
import { TaxRuleEntity } from '../entities';
import { LocationEntity } from '../../tenants/entities';

@Injectable()
export class TaxRulesService {
  constructor(
    @InjectRepository(TaxRuleEntity)
    private readonly rules: Repository<TaxRuleEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
  ) {}

  list(tenantId: string) {
    return this.rules.find({ where: { tenantId }, order: { isDefault: 'DESC', country: 'ASC', taxName: 'ASC' } });
  }

  async create(tenantId: string, dto: UpsertTaxRuleDto) {
    await this.assertLocation(tenantId, dto.locationId);
    const rule = this.rules.create(this.mapDto(tenantId, new TaxRuleEntity(), dto));
    if (rule.isDefault) await this.clearDefault(tenantId, rule.locationId);
    return this.rules.save(rule);
  }

  async update(tenantId: string, dto: UpsertTaxRuleDto) {
    if (!dto.id) throw new NotFoundException('Tax rule not found');
    const rule = await this.rules.findOne({ where: { id: dto.id, tenantId } });
    if (!rule) throw new NotFoundException('Tax rule not found');
    await this.assertLocation(tenantId, dto.locationId);
    this.mapDto(tenantId, rule, dto);
    if (rule.isDefault) await this.clearDefault(tenantId, rule.locationId, rule.id);
    return this.rules.save(rule);
  }

  private mapDto(tenantId: string, rule: TaxRuleEntity, dto: UpsertTaxRuleDto): TaxRuleEntity {
    rule.tenantId = tenantId;
    rule.locationId = dto.locationId ?? null;
    rule.country = dto.country.toUpperCase();
    rule.region = dto.region?.trim() || null;
    rule.taxName = dto.taxName.trim();
    rule.taxRate = dto.taxRate.toFixed(4);
    rule.taxType = dto.taxType;
    rule.appliesTo = dto.appliesTo;
    rule.priceMode = dto.priceMode;
    rule.isDefault = dto.isDefault ?? false;
    rule.roundingMode = dto.roundingMode ?? 'half_up';
    rule.decimalPlaces = dto.decimalPlaces ?? 2;
    rule.taxIdLabel = dto.taxIdLabel?.trim() || null;
    rule.taxIdValue = dto.taxIdValue?.trim() || null;
    return rule;
  }

  private async assertLocation(tenantId: string, locationId?: string) {
    if (!locationId) return;
    const exists = await this.locations.exists({ where: { id: locationId, tenantId } });
    if (!exists) throw new BadRequestException('Location is not valid for this tenant');
  }

  private async clearDefault(tenantId: string, locationId: string | null, excludeId?: string) {
    const current = await this.rules.find({
      where: { tenantId, locationId: locationId ?? IsNull(), isDefault: true },
    });
    for (const rule of current) {
      if (rule.id === excludeId) continue;
      rule.isDefault = false;
      await this.rules.save(rule);
    }
  }
}
