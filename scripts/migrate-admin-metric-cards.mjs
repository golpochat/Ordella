/**
 * Removes local Metric / MetricCard helpers and adds admin-card import.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'admin-ui', 'components');

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, files);
    else if (name.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

const metricFn = /function Metric(?:Card)?\(\{[\s\S]*?\r?\n\}\r?\n/gm;

const importLine = "import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';\n";

for (const file of walk(root)) {
  if (file.includes('admin-card.tsx') || file.includes('admin-detail.tsx')) continue;
  let src = fs.readFileSync(file, 'utf8');
  if (!/function Metric(?:Card)?\(/m.test(src)) continue;
  const before = src;
  src = src.replace(metricFn, '');
  if (!src.includes("from '@/components/ui/admin-card'")) {
    const match = src.match(/^(?:'use client';\r?\n\r?\n)?((?:import .+\r?\n)+)/);
    if (match) {
      const insertAt = match[0].length;
      src = src.slice(0, insertAt) + importLine + src.slice(insertAt);
    } else {
      src = importLine + src;
    }
  }
  if (src !== before) {
    fs.writeFileSync(file, src);
    console.log('updated', path.relative(root, file));
  }
}
