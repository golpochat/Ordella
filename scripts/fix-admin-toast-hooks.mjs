import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const adminComponents = path.join(root, 'apps/admin-ui/components');

const HOOK_LINE =
  '  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();\n';

const MISPLACED =
  /export function (\w+)\(\{\nconst \{ success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo \} = useAdminToast\(\);\n/g;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('toastSuccess') && !content.includes('toastError')) return false;

  let changed = false;

  if (MISPLACED.test(content)) {
    content = content.replace(MISPLACED, 'export function $1({\n');
    changed = true;
  }

  if (content.includes('toastSuccess') && !content.includes('useAdminToast()')) {
    content = content.replace(/(\) => \{|\) \{\n)/, `$1\n${HOOK_LINE}`);
    changed = true;
  } else if (
    content.includes('toastSuccess') &&
    !content.match(/\n  const \{ success: toastSuccess/)
  ) {
    content = content.replace(/(\) => \{|\) \{\n)/, `$1\n${HOOK_LINE}`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('fixed', path.relative(root, filePath));
  }
  return changed;
}

for (const file of walk(adminComponents)) fixFile(file);

// Fix SettingsSection manually - special case
const adminForm = path.join(adminComponents, 'ui/admin-form.tsx');
let form = fs.readFileSync(adminForm, 'utf8');
form = form.replace(
  /export function SettingsSection\(\{\nconst \{ success: toastSuccess[\s\S]*?saveLabel = 'Save',\n\}: SettingsSectionProps\) \{\n\s*const \[error/,
  `export function SettingsSection({\n  title,\n  description,\n  children,\n  onSave,\n  saveLabel = 'Save',\n}: SettingsSectionProps) {\n  const { success: toastSuccess, error: toastError } = useAdminToast();\n  const [error`,
);
form = form.replace(
  /\} catch \(err\) \{\n      setError\(getErrorMessage\(err\)\);\n    \}/,
  `} catch (err) {\n      toastError(getErrorMessage(err));\n    }`,
);
form = form.replace(/\{error \? <ErrorText>\{error\}<\/ErrorText> : null\}\n\s*/g, '');
fs.writeFileSync(adminForm, form);
console.log('fixed admin-form');
