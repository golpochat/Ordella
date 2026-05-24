import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from '../../entities';
import { StoresController } from '../../controllers';
import { StoresService } from '../../services';
import { StoreRepository } from '../../repositories/store.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity])],
  controllers: [StoresController],
  providers: [StoresService, StoreRepository],
  exports: [],
})
export class StoresModule {}
