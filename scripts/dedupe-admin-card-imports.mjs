import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'admin-ui');

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory() && !['node_modules', '.next'].includes(name.name)) walk(full, files);
    else if (name.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

const importRe =
  /import \{([^}]+)\} from '@\/components\/ui\/admin-card';\r?\n/g;

for (const file of walk(root)) {
  let src = fs.readFileSync(file, 'utf8');
  const matches = [...src.matchAll(importRe)];
  if (matches.length <= 1) continue;

  const names = new Set();
  for (const m of matches) {
    m[1].split(',').forEach((part) => {
      const n = part.trim().split(/\s+as\s+/)[0].trim();
      if (n) names.add(n);
    });
  }
  src = src.replace(importRe, '');
  const sorted = [...names].sort();
  const line = `import { ${sorted.join(', ')} } from '@/components/ui/admin-card';\n`;
  const useClient = src.startsWith("'use client';\n\n");
  const offset = useClient ? "'use client';\n\n".length : 0;
  const rest = src.slice(offset);
  const importEnd = rest.search(/\r?\n\r?\n(?!import )/);
  const insertAt = offset + (importEnd >= 0 ? importEnd + 2 : 0);
  src = src.slice(0, insertAt) + line + src.slice(insertAt);
  fs.writeFileSync(file, src);
  console.log('deduped', path.relative(root, file), '->', sorted.join(', '));
}
