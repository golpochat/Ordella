import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cssPath = join(root, 'apps/shared-ui/dist/styles.css');

if (existsSync(cssPath)) {
  process.exit(0);
}

console.log('@ordella/shared-ui: dist/styles.css missing — running build:css…');
const result = spawnSync('npm', ['run', 'build:css', '--workspace=@ordella/shared-ui'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
