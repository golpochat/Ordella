import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from '../../controllers/roles.controller';
import { RolesService } from '../../services/roles.service';
import { RoleRepository } from '../../repositories/role.repository';
import { RoleEntity } from '../../entities/role.entity';
import { RolePermissionEntity } from '../../entities/role-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, RolePermissionEntity])],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
  exports: [],
})
export class RolesModule {}
