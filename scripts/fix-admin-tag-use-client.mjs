import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const adminRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'admin-ui');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

let fixed = 0;
for (const file of walk(adminRoot)) {
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/^import \{ Tag, TagLabel \} from '@\/components\/ui\/admin-tag';\r?\n('use client';)/);
  if (!match) continue;
  const updated = content.replace(
    /^import \{ Tag, TagLabel \} from '@\/components\/ui\/admin-tag';\r?\n'use client';/,
    "'use client';\n\nimport { Tag, TagLabel } from '@/components/ui/admin-tag';",
  );
  fs.writeFileSync(file, updated);
  fixed += 1;
}

console.log(`Fixed ${fixed} files.`);
