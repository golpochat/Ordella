/**
 * Moves standalone SubNav below PageHeader into PageHeader tabs slot.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'apps',
  'admin-ui',
  'app',
);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, files);
    else if (name.name === 'page.tsx') files.push(full);
  }
  return files;
}

for (const file of walk(appDir)) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('<PageHeader') || !src.includes('<SubNav')) continue;
  const before = src;

  src = src.replace(
    /(<PageHeader[\s\S]*?)(\s*\/>)(\s*\r?\n\s*<SubNav items=\{([^}]+)\} \/>)/g,
    '$1\n        tabs={<SubNav variant="embedded" items={$4} />}$2',
  );

  if (src !== before) {
    fs.writeFileSync(file, src);
    console.log('updated', path.relative(appDir, file));
  }
}
