import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from '../../controllers/permissions.controller';
import { PermissionsService } from '../../services/permissions.service';
import { PermissionRepository } from '../../repositories/permission.repository';
import { PermissionEntity } from '../../entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity])],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionRepository],
  exports: [],
})
export class PermissionsModule {}
