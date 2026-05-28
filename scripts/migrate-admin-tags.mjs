/**
 * Migrates admin-ui Badge usage to ODS Tag + TagLabel with semantic variants.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminRoot = path.join(root, 'apps', 'admin-ui');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function mapVariantLiterals(content) {
  return content
    .replace(/variant="destructive"/g, 'variant="error"')
    .replace(/variant='destructive'/g, "variant='error'")
    .replace(/variant="default"/g, 'variant="brand"')
    .replace(/variant='default'/g, "variant='brand'")
    .replace(/variant="secondary"/g, 'variant="neutral"')
    .replace(/variant='secondary'/g, "variant='neutral'")
    .replace(/variant=\{'destructive'\}/g, "variant={'error'}")
    .replace(/variant=\{'default'\}/g, "variant={'brand'}")
    .replace(/variant=\{'secondary'\}/g, "variant={'neutral'}")
    .replace(/variant=\{"destructive"\}/g, 'variant={"error"}')
    .replace(/variant=\{"default"\}/g, 'variant={"brand"}')
    .replace(/variant=\{"secondary"\}/g, 'variant={"neutral"}')
    .replace(/ \? 'destructive'/g, " ? 'error'")
    .replace(/ : 'destructive'/g, " : 'error'")
    .replace(/ \? 'default'/g, " ? 'brand'")
    .replace(/ : 'default'/g, " : 'brand'")
    .replace(/ \? 'secondary'/g, " ? 'neutral'")
    .replace(/ : 'secondary'/g, " : 'neutral'");
}

function badgeToTag(content) {
  return content.replace(/<Badge([^>]*)>([\s\S]*?)<\/Badge>/g, '<Tag$1><TagLabel>$2</TagLabel></Tag>');
}

function updateImports(content, filePath) {
  if (!content.includes('<Tag') && !content.includes('StatusTag') && !content.includes('OrderStatusTag')) {
    return content;
  }
  if (filePath.includes('admin-tag.tsx')) return content;

  const tagImport = "import { Tag, TagLabel } from '@/components/ui/admin-tag';";
  if (content.includes(tagImport)) return content;

  const sharedUiImport = /import\s*\{([^}]+)\}\s*from\s*['"]@shared-ui['"]\s*;?/g;
  let updated = content;
  let needsTagImport = false;

  updated = updated.replace(sharedUiImport, (match, imports) => {
    if (!imports.includes('Badge')) return match;
    const parts = imports
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => p !== 'Badge' && !p.startsWith('type BadgeProps'));
    needsTagImport = true;
    if (parts.length === 0) return '';
    return `import { ${parts.join(', ')} } from '@shared-ui';`;
  });

  if (needsTagImport && !updated.includes("from '@/components/ui/admin-tag'")) {
    const firstImport = updated.search(/^import /m);
    if (firstImport >= 0) {
      updated = `${tagImport}\n${updated}`;
    }
  }

  return updated.replace(/\n{3,}/g, '\n\n');
}

let changed = 0;
for (const file of walk(adminRoot)) {
  if (file.includes('admin-tag.tsx')) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('Badge')) continue;

  const original = content;
  content = mapVariantLiterals(content);
  content = badgeToTag(content);
  content = updateImports(content, file);

  if (content !== original) {
    fs.writeFileSync(file, content);
    changed += 1;
    console.log('updated', path.relative(root, file));
  }
}

console.log(`Done. ${changed} files updated.`);
