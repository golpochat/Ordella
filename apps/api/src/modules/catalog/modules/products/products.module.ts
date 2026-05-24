import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../entities/product.entity';
import { ProductsController } from '../../controllers/products.controller';
import { ProductsService } from '../../services/products.service';
import { ProductRepository } from '../../repositories/product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
  exports: [],
})
export class ProductsModule {}
