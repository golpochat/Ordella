import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddonEntity } from '../../entities/addon.entity';
import { AddonsController } from '../../controllers/addons.controller';
import { AddonsService } from '../../services/addons.service';
import { AddonRepository } from '../../repositories/addon.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AddonEntity])],
  controllers: [AddonsController],
  providers: [AddonsService, AddonRepository],
  exports: [AddonsService, AddonRepository],
})
export class AddonsModule {}
