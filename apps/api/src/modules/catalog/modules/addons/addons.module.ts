import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddonEntity } from '../../entities';
import { AddonsController } from '../../controllers';
import { AddonsService } from '../../services';
import { AddonRepository } from '../../repositories/addon.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AddonEntity])],
  controllers: [AddonsController],
  providers: [AddonsService, AddonRepository],
  exports: [],
})
export class AddonsModule {}
