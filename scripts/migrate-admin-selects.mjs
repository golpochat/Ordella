import fs from 'fs';
import path from 'path';

const root = path.resolve('apps/admin-ui');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walk(full);
    } else if (entry.name.endsWith('.tsx')) {
      migrateFile(full);
    }
  }
}

function migrateFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  if (!content.includes('<select')) return;

  content = content.replace(/<select\b/g, '<Select').replace(/<\/select>/g, '</Select>');
  content = content.replace(
    /\s*className="flex h-10 w-full rounded-md border border-input bg-background px-3(?: py-2)? text-sm"/g,
    '',
  );

  if (content.includes('@shared-ui') && !/\bSelect\b/.test(content.split('from')[0] ?? '')) {
    content = content.replace(
      /import\s*\{([^}]+)\}\s*from\s*'@shared-ui';/,
      (match, inner) => {
        if (inner.includes('Select')) return match;
        return `import { Select, ${inner.trim()} } from '@shared-ui';`;
      },
    );
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('updated', path.relative(root, file));
  }
}

walk(root);
