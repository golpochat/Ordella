import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingDataModule } from '../../../onboarding/onboarding-data.module';
import { UserEntity } from '../../entities/user.entity';
import { AuthenticationController } from '../../controllers';
import { AuthenticationService } from '../../services';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), OnboardingDataModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
