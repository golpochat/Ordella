/**
 * Migrates admin-ui inline form error markup to ODS FormErrorAlert.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminRoot = path.join(root, 'apps', 'admin-ui');

const patterns = [
  {
    re: /\{error \? <p className="text-sm text-destructive">\{error\}<\/p> : null\}/g,
    replace: '{error ? <FormErrorAlert message={error} /> : null}',
  },
  {
    re: /\{error \? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">\{error\}<\/p> : null\}/g,
    replace: '{error ? <FormErrorAlert message={error} /> : null}',
  },
  {
    re: /\{error \? <p className="mt-2 text-sm text-destructive">\{error\}<\/p> : null\}/g,
    replace: '{error ? <FormErrorAlert message={error} /> : null}',
  },
  {
    re: /\{error \? <p className="mb-4 text-sm text-destructive">\{error\}<\/p> : null\}/g,
    replace: '{error ? <FormErrorAlert message={error} className="mb-4" /> : null}',
  },
];

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

function ensureImport(content) {
  if (!content.includes('FormErrorAlert')) return content;
  if (content.includes("from '@/components/ui/admin-form-validation'")) return content;
  if (content.includes("from '@/components/ui/admin-form'") && content.includes('FormErrorAlert')) {
    return content.replace(
      /(import \{[^}]+)(} from '@\/components\/ui\/admin-form')/,
      (match, start, end) => {
        if (start.includes('FormErrorAlert')) return match;
        return `${start}, FormErrorAlert${end}`;
      },
    );
  }
  const importLine = "import { FormErrorAlert } from '@/components/ui/admin-form-validation';\n";
  const useClient = content.match(/^'use client';\r?\n/);
  if (useClient) {
    return content.replace(/^'use client';\r?\n/, `${useClient[0]}\n${importLine}`);
  }
  return `${importLine}${content}`;
}

let changed = 0;
for (const file of walk(adminRoot)) {
  if (file.includes('admin-form-validation') || file.includes('api-error-banner')) continue;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const { re, replace } of patterns) {
    content = content.replace(re, replace);
  }
  if (content !== original) {
    content = ensureImport(content);
    fs.writeFileSync(file, content);
    changed += 1;
    console.log('updated', path.relative(root, file));
  }
}

console.log(`Done. ${changed} files updated.`);
