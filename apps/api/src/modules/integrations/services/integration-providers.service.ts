import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateIntegrationProviderDto } from '../dto';
import { IntegrationProviderResponseDto } from '../dto';
import { UpdateIntegrationProviderDto } from '../dto';
import { IntegrationProviderEntity } from '../entities';
import { IntegrationProviderCategory } from '../enums/integration-provider-category.enum';

const BUILT_IN_PROVIDERS: Array<Pick<IntegrationProviderEntity, 'slug' | 'name' | 'category' | 'configSchema' | 'isActive'>> = [
  { slug: 'xero', name: 'Xero', category: IntegrationProviderCategory.ACCOUNTING, isActive: true, configSchema: { fields: ['clientId', 'tenantId'], scopes: ['accounting.transactions'] } },
  { slug: 'quickbooks', name: 'QuickBooks', category: IntegrationProviderCategory.ACCOUNTING, isActive: true, configSchema: { fields: ['clientId', 'realmId'], scopes: ['accounting'] } },
  { slug: 'uber-direct', name: 'Uber Direct', category: IntegrationProviderCategory.DELIVERY, isActive: true, configSchema: { fields: ['customerId', 'apiKey'], events: ['delivery.created', 'delivery.updated'] } },
  { slug: 'doordash-drive', name: 'DoorDash Drive', category: IntegrationProviderCategory.DELIVERY, isActive: true, configSchema: { fields: ['developerId', 'keyId'], events: ['delivery.updated'] } },
  { slug: 'mailchimp', name: 'Mailchimp', category: IntegrationProviderCategory.MARKETING, isActive: true, configSchema: { fields: ['audienceId'], scopes: ['campaigns', 'lists'] } },
  { slug: 'klaviyo', name: 'Klaviyo', category: IntegrationProviderCategory.MARKETING, isActive: true, configSchema: { fields: ['listId'], scopes: ['profiles', 'events'] } },
  { slug: 'ga4', name: 'Google Analytics 4', category: IntegrationProviderCategory.ANALYTICS, isActive: true, configSchema: { fields: ['measurementId', 'apiSecret'], events: ['purchase', 'view_item'] } },
];

@Injectable()
export class IntegrationProvidersService {
  constructor(
    @InjectRepository(IntegrationProviderEntity)
    private readonly providers: Repository<IntegrationProviderEntity>,
  ) {}

  async findAll(query: FilterPaginationDto): Promise<IntegrationProviderResponseDto[]> {
    await this.ensureBuiltIns();
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const providers = await this.providers.find({ order: { category: 'ASC', name: 'ASC' }, skip: (page - 1) * limit, take: limit });
    return providers.map((provider) => this.toDto(provider));
  }

  async create(dto: CreateIntegrationProviderDto): Promise<IntegrationProviderResponseDto> {
    const provider = await this.providers.save(this.providers.create({
      slug: dto.slug,
      name: dto.name,
      category: dto.category,
      configSchema: dto.configSchema ?? {},
      isActive: dto.isActive ?? true,
    }));
    return this.toDto(provider);
  }

  async findOne(id: string): Promise<IntegrationProviderResponseDto> {
    await this.ensureBuiltIns();
    const provider = await this.providers.findOne({ where: { id } });
    if (!provider) throw new NotFoundException('Integration provider not found');
    return this.toDto(provider);
  }

  async update(
    id: string,
    dto: UpdateIntegrationProviderDto,
  ): Promise<IntegrationProviderResponseDto> {
    const provider = await this.providers.findOne({ where: { id } });
    if (!provider) throw new NotFoundException('Integration provider not found');
    if (dto.name !== undefined) provider.name = dto.name;
    if (dto.category !== undefined) provider.category = dto.category;
    if (dto.configSchema !== undefined) provider.configSchema = dto.configSchema;
    if (dto.isActive !== undefined) provider.isActive = dto.isActive;
    return this.toDto(await this.providers.save(provider));
  }

  private async ensureBuiltIns(): Promise<void> {
    for (const row of BUILT_IN_PROVIDERS) {
      const existing = await this.providers.findOne({ where: { slug: row.slug } });
      if (!existing) await this.providers.save(this.providers.create(row));
    }
  }

  private toDto(provider: IntegrationProviderEntity): IntegrationProviderResponseDto {
    return {
      id: provider.id,
      slug: provider.slug,
      name: provider.name,
      category: provider.category as IntegrationProviderCategory,
      configSchema: provider.configSchema,
      isActive: provider.isActive,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }
}
