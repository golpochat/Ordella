import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertTaxCategoryDto } from '../dto';
import { TaxCategoryEntity, TaxRuleEntity } from '../entities';

@Injectable()
export class TaxCategoriesService {
  constructor(
    @InjectRepository(TaxCategoryEntity)
    private readonly categories: Repository<TaxCategoryEntity>,
    @InjectRepository(TaxRuleEntity)
    private readonly rules: Repository<TaxRuleEntity>,
  ) {}

  list(tenantId: string) {
    return this.categories.find({ where: { tenantId }, relations: { defaultTaxRule: true }, order: { name: 'ASC' } });
  }

  async create(tenantId: string, dto: UpsertTaxCategoryDto) {
    await this.assertRule(tenantId, dto.defaultTaxRuleId);
    return this.categories.save(this.categories.create({
      tenantId,
      name: dto.name.trim(),
      description: dto.description?.trim() ?? null,
      defaultTaxRuleId: dto.defaultTaxRuleId ?? null,
    }));
  }

  async update(tenantId: string, dto: UpsertTaxCategoryDto) {
    if (!dto.id) throw new NotFoundException('Tax category not found');
    const category = await this.categories.findOne({ where: { id: dto.id, tenantId } });
    if (!category) throw new NotFoundException('Tax category not found');
    await this.assertRule(tenantId, dto.defaultTaxRuleId);
    category.name = dto.name.trim();
    category.description = dto.description?.trim() ?? null;
    category.defaultTaxRuleId = dto.defaultTaxRuleId ?? null;
    return this.categories.save(category);
  }

  private async assertRule(tenantId: string, ruleId?: string) {
    if (!ruleId) return;
    const exists = await this.rules.exists({ where: { id: ruleId, tenantId } });
    if (!exists) throw new BadRequestException('Default tax rule is not valid for this tenant');
  }
}
