import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController, UsersController } from '../../controllers';
import { UsersService } from '../../services';
import { UserRepository } from '../../repositories/user.repository';
import { RoleEntity, UserEntity } from '../../entities';
import { TenantMembershipEntity } from '../../../onboarding/entities/tenant-membership.entity';
import { LocationEntity, UserLocationAssignmentEntity } from '../../../tenants/entities';
import { UserLocationRepository } from '../../../tenants/repositories/user-location.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      LocationEntity,
      TenantMembershipEntity,
      UserLocationAssignmentEntity,
    ]),
  ],
  controllers: [UsersController, StaffController],
  providers: [UsersService, UserRepository, UserLocationRepository],
  exports: [],
})
export class UsersModule {}
