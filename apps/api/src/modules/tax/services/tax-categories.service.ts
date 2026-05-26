import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertTaxCategoryDto } from '../dto';
import { TaxCategoryEntity, TaxRuleEntity } from '../entities';
import { TaxRulesService } from './tax-rules.service';

const DEFAULT_TAX_CATEGORY_NAMES = [
  { name: 'Standard VAT', rate: '23.0000', description: 'Ireland standard VAT rate' },
  { name: 'Reduced VAT 13.5%', rate: '13.5000', description: 'Ireland reduced VAT rate' },
  { name: 'Reduced VAT 9%', rate: '9.0000', description: 'Ireland second reduced VAT rate' },
  { name: 'Zero VAT', rate: '0.0000', description: 'Zero-rated VAT category' },
] as const;

@Injectable()
export class TaxCategoriesService {
  constructor(
    @InjectRepository(TaxCategoryEntity)
    private readonly categories: Repository<TaxCategoryEntity>,
    @InjectRepository(TaxRuleEntity)
    private readonly rules: Repository<TaxRuleEntity>,
    private readonly taxRulesService: TaxRulesService,
  ) {}

  async list(tenantId: string) {
    await this.ensureDefaultCategories(tenantId);
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

  private async ensureDefaultCategories(tenantId: string): Promise<void> {
    const [rules, categories] = await Promise.all([
      this.taxRulesService.ensureDefaultIrishVatRules(tenantId),
      this.categories.find({ where: { tenantId } }),
    ]);
    const categoryNames = new Set(categories.map((category) => category.name.toLowerCase()));
    const rows = DEFAULT_TAX_CATEGORY_NAMES.filter((category) => !categoryNames.has(category.name.toLowerCase()))
      .map((category) => {
        const rule = rules.find((candidate) => Number(candidate.taxRate).toFixed(4) === category.rate);
        return this.categories.create({
          tenantId,
          name: category.name,
          description: category.description,
          defaultTaxRuleId: rule?.id ?? null,
        });
      });
    if (rows.length) {
      await this.categories.save(rows);
    }
  }
}
