import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });
config({ path: resolve(__dirname, '../../../../.env') });

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [resolve(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [resolve(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
});
