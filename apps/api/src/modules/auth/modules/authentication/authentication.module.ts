import { Module } from '@nestjs/common';
import { AuthenticationController } from '../../controllers/authentication.controller';
import { AuthenticationService } from '../../services/authentication.service';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
