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

const textareaClass =
  /className="min-h-32 w-full max-w-full rounded-md border border-input bg-background p-3 font-mono text-sm[^"]*"/g;

function migrateFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  if (!content.includes('<textarea')) return;

  content = content.replace(/<textarea\b/g, '<Textarea').replace(/<\/textarea>/g, '</Textarea>');
  content = content.replace(textareaClass, 'className="min-h-32 font-mono"');

  if (content.includes('@shared-ui') && !content.includes('Textarea')) {
    content = content.replace(/import\s*\{([^}]+)\}\s*from\s*'@shared-ui';/, (match, inner) => {
      if (inner.includes('Textarea')) return match;
      return `import { Textarea, ${inner.trim()} } from '@shared-ui';`;
    });
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('updated', path.relative(root, file));
  }
}

walk(root);
