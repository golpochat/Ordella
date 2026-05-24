import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsController } from '../../controllers';
import { SessionsService } from '../../services';
import { SessionRepository } from '../../repositories/session.repository';
import { SessionEntity } from '../../entities';
import { UserDeviceEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, UserDeviceEntity])],
  controllers: [SessionsController],
  providers: [SessionsService, SessionRepository],
  exports: [],
})
export class SessionsModule {}
