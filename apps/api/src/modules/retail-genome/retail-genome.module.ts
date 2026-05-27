import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { EventStoreRecordEntity } from '../event-bus/entities/event-store-record.entity';
import { RetailGenomeController } from './controllers/retail-genome.controller';
import { RETAIL_GENOME_ENTITIES } from './entities';
import { RetailGenomeService } from './services/retail-genome.service';

@Module({
  imports: [
    AuditModule,
    AuthModule,
    TypeOrmModule.forFeature([...RETAIL_GENOME_ENTITIES, EventStoreRecordEntity]),
  ],
  controllers: [RetailGenomeController],
  providers: [RetailGenomeService],
  exports: [RetailGenomeService],
})
export class RetailGenomeModule {}
