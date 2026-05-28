import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const adminComponents = path.join(root, 'apps/admin-ui/components');
const HOOK_LINE =
  '  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();\n';

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

  content = content.replace(
    /^[ \t]*const \{ success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo \} = useAdminToast\(\);\r?\n/gm,
    '',
  );

  let match = content.match(/export function \w+\([\s\S]*?\}\)\s*\{/);
  if (!match) match = content.match(/export function \w+\([^)]*\)\s*\{/);
  if (!match) return false;

  const insertAt = match.index + match[0].length;
  content = content.slice(0, insertAt) + '\n' + HOOK_LINE + content.slice(insertAt);

  fs.writeFileSync(filePath, content);
  console.log('fixed', path.relative(root, filePath));
  return true;
}

for (const file of walk(adminComponents)) fixFile(file);

// admin-form SettingsSection
const adminForm = path.join(adminComponents, 'ui/admin-form.tsx');
let form = fs.readFileSync(adminForm, 'utf8');
form = form.replace(
  /export function SettingsSection\(\{[\s\S]*?saveLabel = 'Save',\n\}: SettingsSectionProps\) \{\n/,
  `export function SettingsSection({\n  title,\n  description,\n  children,\n  onSave,\n  saveLabel = 'Save',\n}: SettingsSectionProps) {\n  const { success: toastSuccess, error: toastError } = useAdminToast();\n`,
);
form = form.replace(/const \[error, setError\] = useState<string \| null>\(null\);\n/, '');
form = form.replace(/setError\(null\);\n\s*/g, '');
form = form.replace(/setError\(getErrorMessage\(err\)\);/, 'toastError(getErrorMessage(err));');
form = form.replace(/\{error \? <ErrorText>\{error\}<\/ErrorText> : null\}\n\s*/g, '');
if (!form.includes('ErrorText')) {
  form = form.replace(/  ErrorText,\n/, '');
}
fs.writeFileSync(adminForm, form);
console.log('fixed admin-form SettingsSection');
