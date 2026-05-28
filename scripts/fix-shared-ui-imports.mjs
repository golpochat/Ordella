/**
 * Collapses broken multi-line @shared-ui imports (split after `Badge,`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'apps',
  'admin-ui',
);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory() && name.name !== 'node_modules' && name.name !== '.next') walk(full, files);
    else if (name.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

const broken = /import \{ Select, Badge,\s*\r?\n([\s\S]*?)\} from '@shared-ui';/g;

for (const file of walk(root)) {
  let src = fs.readFileSync(file, 'utf8');
  if (!broken.test(src)) continue;
  broken.lastIndex = 0;
  const next = src.replace(broken, (_, body) => {
    const names = body
      .split(/,\s*\r?\n/)
      .map((line) => line.trim().replace(/,$/, ''))
      .filter(Boolean);
    return `import { Select, Badge, ${names.join(', ')} } from '@shared-ui';`;
  });
  if (next !== src) {
    fs.writeFileSync(file, next);
    console.log('fixed', path.relative(root, file));
  }
}
