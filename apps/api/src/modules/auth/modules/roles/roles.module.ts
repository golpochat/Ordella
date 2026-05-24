import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from '../../controllers';
import { RolesService } from '../../services';
import { RoleRepository } from '../../repositories/role.repository';
import { RoleEntity } from '../../entities';
import { RolePermissionEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, RolePermissionEntity])],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
  exports: [],
})
export class RolesModule {}
