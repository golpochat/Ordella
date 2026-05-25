import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ALL_PERMISSION_KEYS } from '../../../common/rbac/role-permissions';
import { PermissionResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { PermissionEntity } from '../entities';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissions: Repository<PermissionEntity>,
  ) {}

  async findAll(query: FilterPaginationDto): Promise<PermissionResponseDto[]> {
    await this.ensureCatalog();
    const page = query.page ?? 1;
    const limit = query.limit ?? 200;
    const rows = await this.permissions.find({
      order: { key: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      description: row.description,
      createdAt: row.createdAt,
    }));
  }

  private async ensureCatalog(): Promise<void> {
    for (const key of ALL_PERMISSION_KEYS) {
      const existing = await this.permissions.findOne({ where: { key } });
      if (!existing) {
        await this.permissions.save(this.permissions.create({ key, description: key }));
      }
    }
  }
}
