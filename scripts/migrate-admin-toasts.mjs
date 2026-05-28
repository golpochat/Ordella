import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const adminComponents = path.join(root, 'apps/admin-ui/components');

const skipFiles = new Set(['procurement/supplier-portal-panel.tsx']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

function isErrorMessage(expr) {
  const trimmed = expr.trim();
  return (
    trimmed.includes('getErrorMessage(') ||
    /fail|error|unable|invalid|denied/i.test(trimmed.replace(/['"`]/g, ''))
  );
}

function pickVariant(expr) {
  if (isErrorMessage(expr)) return 'error';
  if (/warn|partial|retry/i.test(expr)) return 'warning';
  if (/^\s*[`'"].*result.*[`'"]\s*$/.test(expr) || expr.includes('result(s)')) return 'info';
  return 'success';
}

function migrateFile(filePath) {
  const rel = path.relative(path.join(adminComponents, '..'), filePath).replace(/\\/g, '/');
  const relFromComponents = path.relative(adminComponents, filePath).replace(/\\/g, '/');
  if (skipFiles.has(relFromComponents)) return false;
  if (!relFromComponents.endsWith('.tsx')) return false;

  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('const [message, setMessage]')) return false;

  if (!content.includes("from '@/components/ui/admin-toast'")) {
    const useClient = content.startsWith("'use client'");
    const importLine = "import { useAdminToast } from '@/components/ui/admin-toast';\n";
    if (useClient) {
      content = content.replace(/^('use client';\r?\n\r?\n)/, `$1${importLine}`);
    } else {
      content = `${importLine}${content}`;
    }
  }

  content = content.replace(
    /const \[message, setMessage\] = useState<[^>]+>\([^)]*\);\r?\n/g,
    '',
  );

  const hookName = 'const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();\n';
  if (!content.includes('useAdminToast()')) {
    const fnMatch = content.match(/export function \w+[^{]*\{\r?\n/);
    if (fnMatch) {
      const insertAt = fnMatch.index + fnMatch[0].length;
      content = content.slice(0, insertAt) + hookName + content.slice(insertAt);
    }
  }

  content = content.replace(/setMessage\(null\);\r?\n\s*/g, '');
  content = content.replace(/setMessage\(([^)]+)\);\r?\n/g, (_, expr) => {
    const variant = pickVariant(expr);
    const fn =
      variant === 'error'
        ? 'toastError'
        : variant === 'warning'
          ? 'toastWarning'
          : variant === 'info'
            ? 'toastInfo'
            : 'toastSuccess';
    return `${fn}(${expr});\n`;
  });

  content = content.replace(
    /\{message \? \(\s*<p[^>]*>[\s\S]*?\{message\}[\s\S]*?<\/p>\s*\) : null\}\s*\r?\n?/g,
    '',
  );
  content = content.replace(
    /\{message \? <p className="[^"]*">\{message\}<\/p> : null\}\s*\r?\n?/g,
    '',
  );
  content = content.replace(
    /\{message \? \(\s*<p className="text-sm text-muted-foreground" role="status">\s*\{message\}\s*<\/p>\s*\) : null\}\s*\r?\n?/g,
    '',
  );

  fs.writeFileSync(filePath, content);
  console.log('migrated', rel);
  return true;
}

const files = walk(adminComponents);
let count = 0;
for (const file of files) {
  if (migrateFile(file)) count += 1;
}
console.log(`Done. ${count} files updated.`);
