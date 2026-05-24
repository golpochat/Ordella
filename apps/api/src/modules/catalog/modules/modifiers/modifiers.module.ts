import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModifierEntity } from '../../entities';
import { ModifierOptionEntity } from '../../entities';
import { ModifiersController } from '../../controllers';
import { ModifiersService } from '../../services';
import { ModifierRepository } from '../../repositories/modifier.repository';
import { ModifierOptionRepository } from '../../repositories/modifier-option.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ModifierEntity, ModifierOptionEntity])],
  controllers: [ModifiersController],
  providers: [ModifiersService, ModifierRepository, ModifierOptionRepository],
  exports: [],
})
export class ModifiersModule {}
