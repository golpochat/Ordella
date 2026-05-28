/**
 * Repairs broken admin-card imports inserted inside other import blocks.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const components = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'apps',
  'admin-ui',
);

const metricImport =
  "import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';\n";

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory() && name.name !== 'node_modules' && name.name !== '.next') walk(full, files);
    else if (name.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

for (const file of walk(components)) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  src = src.replace(
    /import \{\s*\r?\nimport \{ Metric(?:Card)?(?:, MetricGrid)?(?:, MetricCard)? \} from '@\/components\/ui\/admin-card';\r?\n/g,
    'import {\n',
  );
  src = src.replace(
    /,\s*\r?\nimport \{ Metric(?:Card)?(?:, MetricGrid)?(?:, MetricCard)? \} from '@\/components\/ui\/admin-card';\r?\n/g,
    ',\n',
  );

  const imports = src.match(/import \{ Metric(?:Card)?(?:, MetricGrid)?(?:, MetricCard)? \} from '@\/components\/ui\/admin-card';\r?\n/g);
  if (imports && imports.length > 1) {
    src = src.replace(
      /import \{ Metric(?:Card)?(?:, MetricGrid)?(?:, MetricCard)? \} from '@\/components\/ui\/admin-card';\r?\n/g,
      '',
    );
    const usesMetric = /\b(MetricCard|MetricGrid|<Metric\b)/.test(src);
    if (usesMetric) {
      const useClient = src.startsWith("'use client';\n\n");
      const offset = useClient ? "'use client';\n\n".length : 0;
      const rest = src.slice(offset);
      const importEnd = rest.search(/\r?\n\r?\n(?!import )/);
      const insertAt = offset + (importEnd >= 0 ? importEnd + 2 : 0);
      src = src.slice(0, insertAt) + metricImport + src.slice(insertAt);
    }
  }

  const usesMetric = /\b(MetricCard|MetricGrid|<Metric\b)/.test(src);
  const hasImport = src.includes("from '@/components/ui/admin-card'");
  if (usesMetric && !hasImport) {
    const useClient = src.startsWith("'use client';\n\n");
    const offset = useClient ? "'use client';\n\n".length : 0;
    const rest = src.slice(offset);
    const importEnd = rest.search(/\r?\n\r?\n(?!import )/);
    const insertAt = offset + (importEnd >= 0 ? importEnd + 2 : 0);
    src = src.slice(0, insertAt) + metricImport + src.slice(insertAt);
  }

  if (src !== before) {
    fs.writeFileSync(file, src);
    console.log('fixed', path.relative(components, file));
  }
}
