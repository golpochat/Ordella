#!/usr/bin/env node
/**
 * Scans admin-ui for translation keys (t('...'), labelKey) and reports keys missing from en.json.
 * Usage: node apps/admin-ui/scripts/extract-admin-i18n.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const enPath = join(root, 'locales', 'en.json');
const en = JSON.parse(readFileSync(enPath, 'utf8'));

const keyPatterns = [
  /\bt\(\s*['"`]([^'"`]+)['"`]/g,
  /labelKey:\s*['"`]([^'"`]+)['"`]/g,
  /titleKey:\s*['"`]([^'"`]+)['"`]/g,
];

function flatten(obj, prefix = '') {
  const keys = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const nested of flatten(v, path)) keys.add(nested);
    } else {
      keys.add(path);
    }
  }
  return keys;
}

const defined = flatten(en);
const found = new Set();

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue;
      walk(full);
      continue;
    }
    if (!/\.(tsx?|jsx?)$/.test(name)) continue;
    const text = readFileSync(full, 'utf8');
    for (const pattern of keyPatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text))) {
        found.add(match[1]);
      }
    }
  }
}

walk(join(root, 'app'));
walk(join(root, 'components'));
walk(join(root, 'lib'));

const missing = [...found].filter((k) => !defined.has(k)).sort();
const unused = [...defined].filter((k) => !found.has(k)).sort();

console.log(`Defined keys: ${defined.size}`);
console.log(`Referenced keys: ${found.size}`);
console.log(`Missing from en.json: ${missing.length}`);
if (missing.length) {
  console.log(missing.slice(0, 40).join('\n'));
  if (missing.length > 40) console.log(`… and ${missing.length - 40} more`);
}
console.log(`Potentially unused (not referenced in scan): ${unused.length}`);
