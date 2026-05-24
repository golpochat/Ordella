import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantEntity } from '../../entities';
import { VariantsController } from '../../controllers';
import { VariantsService } from '../../services';
import { VariantRepository } from '../../repositories/variant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([VariantEntity])],
  controllers: [VariantsController],
  providers: [VariantsService, VariantRepository],
  exports: [],
})
export class VariantsModule {}
