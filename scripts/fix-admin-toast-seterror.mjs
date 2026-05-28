import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const adminComponents = path.join(root, 'apps/admin-ui/components');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

for (const file of walk(adminComponents)) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('useAdminToast') || !content.includes('setError')) continue;

  const updated = content
    .replace(/setError\(null\);\s*\n\s*/g, '')
    .replace(/setError\(/g, 'toastError(')
    .replace(/\{error \? \(\s*<p className="text-sm text-destructive"[^>]*>[\s\S]*?\{error\}[\s\S]*?<\/p>\s*\) : null\}\s*\n?/g, '')
    .replace(/\{error \? <p className="text-sm text-destructive">\{error\}<\/p> : null\}\s*\n?/g, '');

  if (updated !== content) {
    fs.writeFileSync(file, updated);
    console.log('fixed setError', path.relative(root, file));
  }
}
