import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantEntity } from '../../entities/variant.entity';
import { VariantsController } from '../../controllers/variants.controller';
import { VariantsService } from '../../services/variants.service';
import { VariantRepository } from '../../repositories/variant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([VariantEntity])],
  controllers: [VariantsController],
  providers: [VariantsService, VariantRepository],
  exports: [],
})
export class VariantsModule {}
