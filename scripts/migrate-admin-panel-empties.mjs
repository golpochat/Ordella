/**
 * Replaces inline empty <p> tags with ODS PanelEmpty in admin-ui components.
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
    if (name.isDirectory() && !['node_modules', '.next'].includes(name.name)) walk(full, files);
    else if (name.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

const importLine = "import { PanelEmpty } from '@/components/ui/admin-empty-state';\n";

const patterns = [
  {
    re: /<p className="text-sm text-muted-foreground">([^<]+)<\/p>/g,
    build: (text) => {
      const title = text.trim().replace(/\.$/, '');
      if (!/^No /i.test(title)) return null;
      return `<PanelEmpty title="${title.replace(/"/g, '\\"')}" description="Content will appear here when available." />`;
    },
  },
  {
    re: /<p className="py-6 text-center text-sm text-muted-foreground">([^<]+)<\/p>/g,
    build: (text) => {
      const title = text.trim().replace(/\.$/, '');
      if (!/^No /i.test(title)) return null;
      return `<PanelEmpty title="${title.replace(/"/g, '\\"')}" description="Content will appear here when available." />`;
    },
  },
  {
    re: /<TableCell colSpan=\{(\d+)\} className="text-center text-sm text-muted-foreground">([^<]+)<\/TableCell>/g,
    build: (_colSpan, text) => {
      const title = text.trim().replace(/\.$/, '');
      return `<TableCell colSpan={${_colSpan}} className="p-0"><PanelEmpty title="${title.replace(/"/g, '\\"')}" description="Transactions and activity will appear here." size="compact" className="max-w-none border-0 shadow-none" /></TableCell>`;
    },
    custom: true,
  },
];

for (const file of walk(path.join(root, 'components'))) {
  if (file.includes('admin-empty-state') || file.includes('empty-state.tsx')) continue;
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('text-muted-foreground">No ')) continue;
  const before = src;

  for (const { re, build, custom } of patterns) {
    if (custom) {
      src = src.replace(re, (match, a, b) => build(a, b) ?? match);
    } else {
      src = src.replace(re, (match, text) => build(text) ?? match);
    }
  }

  if (src !== before) {
    if (!src.includes("from '@/components/ui/admin-empty-state'")) {
      const useClient = src.startsWith("'use client';\n\n");
      const offset = useClient ? "'use client';\n\n".length : 0;
      const rest = src.slice(offset);
      const importEnd = rest.search(/\r?\n\r?\n(?!import )/);
      const insertAt = offset + (importEnd >= 0 ? importEnd + 2 : 0);
      src = src.slice(0, insertAt) + importLine + src.slice(insertAt);
    }
    fs.writeFileSync(file, src);
    console.log('updated', path.relative(root, file));
  }
}

// app pages
for (const file of walk(path.join(root, 'app'))) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('text-muted-foreground">No ')) continue;
  const before = src;
  src = src.replace(
    /<p className="text-sm text-muted-foreground">([^<]+)<\/p>/g,
    (match, text) => {
      const title = text.trim().replace(/\.$/, '');
      if (!/^No /i.test(title)) return match;
      return `<PanelEmpty title="${title.replace(/"/g, '\\"')}" description="Content will appear here when available." />`;
    },
  );
  if (src !== before) {
    if (!src.includes("from '@/components/ui/admin-empty-state'")) {
      const m = src.match(/^(?:'use client';\r?\n\r?\n)?((?:import .+\r?\n)+)/);
      if (m) src = src.slice(0, m[0].length) + importLine + src.slice(m[0].length);
    }
    fs.writeFileSync(file, src);
    console.log('updated', path.relative(root, file));
  }
}
