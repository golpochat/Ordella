import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from '../../controllers';
import { RolesService } from '../../services';
import { RoleRepository } from '../../repositories/role.repository';
import { RoleEntity } from '../../entities';
import { RolePermissionEntity } from '../../entities';
import { PermissionEntity, UserEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, RolePermissionEntity, PermissionEntity, UserEntity])],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
  exports: [],
})
export class RolesModule {}
