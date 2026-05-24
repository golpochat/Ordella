import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../../entities';
import { CategoriesController } from '../../controllers';
import { CategoriesService } from '../../services';
import { CategoryRepository } from '../../repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepository],
  exports: [],
})
export class CategoriesModule {}
