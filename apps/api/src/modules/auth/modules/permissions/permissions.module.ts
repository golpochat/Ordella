import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from '../../controllers';
import { PermissionsService } from '../../services';
import { PermissionRepository } from '../../repositories/permission.repository';
import { PermissionEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity])],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionRepository],
  exports: [],
})
export class PermissionsModule {}
