import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from '../../entities/store.entity';
import { StoresController } from '../../controllers/stores.controller';
import { StoresService } from '../../services/stores.service';
import { StoreRepository } from '../../repositories/store.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity])],
  controllers: [StoresController],
  providers: [StoresService, StoreRepository],
  exports: [StoresService, StoreRepository],
})
export class StoresModule {}
