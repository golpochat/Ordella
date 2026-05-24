import { Module } from '@nestjs/common';
import { AuthenticationController } from '../../controllers';
import { AuthenticationService } from '../../services';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [],
})
export class AuthenticationModule {}
