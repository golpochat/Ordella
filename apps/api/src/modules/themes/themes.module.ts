import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ThemesController } from './controllers';
import { THEME_ENTITIES } from './entities';
import { ThemesService } from './services';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature(THEME_ENTITIES)],
  controllers: [ThemesController],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}
