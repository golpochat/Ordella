import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../catalog/entities/category.entity';
import { ModifierEntity } from '../../catalog/entities/modifier.entity';
import { ModifierOptionEntity } from '../../catalog/entities/modifier-option.entity';

@Injectable()
export class AdminCatalogRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ModifierEntity)
    private readonly modifierRepository: Repository<ModifierEntity>,
    @InjectRepository(ModifierOptionEntity)
    private readonly modifierOptionRepository: Repository<ModifierOptionEntity>,
  ) {}

  listCategories(tenantId: string): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({
      where: { tenantId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findCategory(tenantId: string, id: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({ where: { id, tenantId } });
  }

  saveCategory(category: CategoryEntity): Promise<CategoryEntity> {
    return this.categoryRepository.save(category);
  }

  createCategory(partial: Partial<CategoryEntity>): CategoryEntity {
    return this.categoryRepository.create(partial);
  }

  listModifiers(tenantId: string): Promise<ModifierEntity[]> {
    return this.modifierRepository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  findModifier(tenantId: string, id: string): Promise<ModifierEntity | null> {
    return this.modifierRepository.findOne({ where: { id, tenantId } });
  }

  saveModifier(modifier: ModifierEntity): Promise<ModifierEntity> {
    return this.modifierRepository.save(modifier);
  }

  createModifier(partial: Partial<ModifierEntity>): ModifierEntity {
    return this.modifierRepository.create(partial);
  }

  listModifierOptions(modifierId: string): Promise<ModifierOptionEntity[]> {
    return this.modifierOptionRepository.find({
      where: { modifierId },
      order: { name: 'ASC' },
    });
  }

  saveModifierOption(option: ModifierOptionEntity): Promise<ModifierOptionEntity> {
    return this.modifierOptionRepository.save(option);
  }

  createModifierOption(partial: Partial<ModifierOptionEntity>): ModifierOptionEntity {
    return this.modifierOptionRepository.create(partial);
  }
}
