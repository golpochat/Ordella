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

function fixFile(filePath) {
  if (filePath.includes('supplier-portal-panel')) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('setMessage(')) return false;

  content = content.replace(/setMessage\(([^)]+)\);/g, (_, expr) => {
    if (expr.includes('getErrorMessage')) return `toastError(${expr});`;
    if (/result\(s\)|Replayed|records written|Sync queued/i.test(expr)) return `toastInfo(${expr});`;
    return `toastSuccess(${expr});`;
  });

  if (content.includes('toastSuccess') && !content.includes('useAdminToast()')) {
    const match = content.match(/export function \w+\([\s\S]*?\}\)\s*\{/) || content.match(/export function \w+\([^)]*\)\s*\{/);
    if (match) {
      const insertAt = match.index + match[0].length;
      content =
        content.slice(0, insertAt) +
        '\n  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();\n' +
        content.slice(insertAt);
    }
    if (!content.includes("from '@/components/ui/admin-toast'")) {
      content = content.replace(/^('use client';\r?\n\r?\n)?/, "$1import { useAdminToast } from '@/components/ui/admin-toast';\n");
    }
  }

  fs.writeFileSync(filePath, content);
  console.log('fixed setMessage', path.relative(root, filePath));
  return true;
}

for (const file of walk(adminComponents)) fixFile(file);
