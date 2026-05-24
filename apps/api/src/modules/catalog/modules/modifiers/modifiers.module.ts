import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModifierEntity } from '../../entities/modifier.entity';
import { ModifierOptionEntity } from '../../entities/modifier-option.entity';
import { ModifiersController } from '../../controllers/modifiers.controller';
import { ModifiersService } from '../../services/modifiers.service';
import { ModifierRepository } from '../../repositories/modifier.repository';
import { ModifierOptionRepository } from '../../repositories/modifier-option.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ModifierEntity, ModifierOptionEntity])],
  controllers: [ModifiersController],
  providers: [ModifiersService, ModifierRepository, ModifierOptionRepository],
  exports: [ModifiersService, ModifierRepository],
})
export class ModifiersModule {}
