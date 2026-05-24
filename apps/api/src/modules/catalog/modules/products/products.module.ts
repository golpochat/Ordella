import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../entities';
import { ProductsController } from '../../controllers';
import { ProductsService } from '../../services';
import { ProductRepository } from '../../repositories/product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
  exports: [],
})
export class ProductsModule {}
