/**
 * Replaces simple metric row grids with MetricGrid.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const components = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'apps',
  'admin-ui',
  'components',
);

const patterns = [
  {
    re: /<div className="grid gap-4 md:grid-cols-4">\s*\n([\s\S]*?)<\/div>/g,
    cols: 4,
  },
  {
    re: /<div className="grid gap-3 md:grid-cols-5">\s*\n([\s\S]*?)<\/div>/g,
    cols: 5,
  },
  {
    re: /<div className="grid gap-3 md:grid-cols-4">\s*\n([\s\S]*?)<\/div>/g,
    cols: 4,
  },
  {
    re: /<div className="grid gap-4 md:grid-cols-5">\s*\n([\s\S]*?)<\/div>/g,
    cols: 5,
  },
  {
    re: /<div className="grid gap-3 md:grid-cols-3">\s*\n([\s\S]*?)<\/div>/g,
    cols: 3,
  },
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, files);
    else if (name.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

for (const file of walk(components)) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('<Metric')) continue;
  const before = src;
  for (const { re, cols } of patterns) {
    re.lastIndex = 0;
    src = src.replace(re, (match, body) => {
      if (!body.includes('<Metric')) return match;
      return `<MetricGrid columns={${cols}}>\n${body}</MetricGrid>`;
    });
  }
  if (src !== before) {
    if (!src.includes("MetricGrid") || !src.includes("admin-card")) {
      const anchor = src.indexOf("from '@/components/ui/admin-card'");
      if (anchor === -1) {
        const line = "import { Metric, MetricGrid } from '@/components/ui/admin-card';\n";
        const m = src.match(/^(?:'use client';\r?\n\r?\n)?((?:import .+\r?\n)+)/);
        if (m) src = src.slice(0, m[0].length) + line + src.slice(m[0].length);
      }
    }
    fs.writeFileSync(file, src);
    console.log('updated', path.relative(components, file));
  }
}
