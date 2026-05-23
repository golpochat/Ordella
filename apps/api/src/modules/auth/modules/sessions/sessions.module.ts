import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsController } from '../../controllers/sessions.controller';
import { SessionsService } from '../../services/sessions.service';
import { SessionRepository } from '../../repositories/session.repository';
import { SessionEntity } from '../../entities/session.entity';
import { UserDeviceEntity } from '../../entities/user-device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, UserDeviceEntity])],
  controllers: [SessionsController],
  providers: [SessionsService, SessionRepository],
  exports: [SessionsService, SessionRepository],
})
export class SessionsModule {}
