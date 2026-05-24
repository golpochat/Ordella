import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { loadDeploymentConfig } from '../config/deployment.config';

const DESTRUCTIVE_PATTERNS = [
  /\bDROP\s+TABLE\b/i,
  /\bDROP\s+COLUMN\b/i,
  /\bTRUNCATE\b/i,
  /\bDELETE\s+FROM\b/i,
];

@Injectable()
export class MigrationRunnerService {
  private readonly logger = new Logger(MigrationRunnerService.name);
  private readonly config = loadDeploymentConfig();

  private apiRoot(): string {
    const candidates = [process.cwd(), resolve(process.cwd(), 'apps/api')];
    for (const dir of candidates) {
      if (existsSync(resolve(dir, 'src/database/migrations'))) {
        return dir;
      }
    }
    return process.cwd();
  }

  assertProductionSafe(): void {
    if (this.config.env !== 'production') {
      return;
    }

    const migrationsDir = resolve(this.apiRoot(), 'src/database/migrations');
    const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.ts'));

    for (const file of files) {
      const full = readFileSync(resolve(migrationsDir, file), 'utf8');
      const sql = this.extractUpSection(full);
      for (const pattern of DESTRUCTIVE_PATTERNS) {
        if (pattern.test(sql) && !this.config.allowDestructiveMigrations) {
          throw new Error(
            `Destructive migration blocked in production: ${file}. Set ALLOW_DESTRUCTIVE_MIGRATIONS=true only after backup.`,
          );
        }
      }
    }
  }

  private extractUpSection(content: string): string {
    const match = content.match(/public async up[\s\S]*?(?=public async down)/);
    return match?.[0] ?? content;
  }

  runPendingMigrations(): void {
    this.assertProductionSafe();
    this.logger.log('Running database migrations…');
    execSync('npm run migration:run', {
      cwd: this.apiRoot(),
      stdio: 'inherit',
      env: process.env,
    });
  }
}
