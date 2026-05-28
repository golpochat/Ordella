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
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('toastSuccess') && !content.includes('toastError')) return false;

  let changed = false;

  if (content.includes('setError(getErrorMessage(err))')) {
    content = content.replace(/setError\(getErrorMessage\(err\)\);/g, 'toastError(getErrorMessage(err));');
    changed = true;
  }

  if (content.includes('setError((body')) {
    content = content.replace(
      /setError\(\(body as \{ message\?: string \} \| null\)\?\.message \?\? '[^']+'\);/g,
      (match) => match.replace('setError', 'toastError'),
    );
    changed = true;
  }

  content = content.replace(/const \[error, setError\] = useState<string \| null>\(null\);\r?\n\s*/g, () => {
    changed = true;
    return '';
  });
  content = content.replace(/setError\(null\);\r?\n\s*/g, () => {
    changed = true;
    return '';
  });

  content = content.replace(
    /\{error \? <p className="[^"]*text-destructive[^"]*">\{error\}<\/p> : null\}\s*\r?\n?/g,
    () => {
      changed = true;
      return '';
    },
  );
  content = content.replace(
    /\{error \? <p className="rounded-md border border-destructive[^>]*>\{error\}<\/p> : null\}\s*\r?\n?/g,
    () => {
      changed = true;
      return '';
    },
  );
  content = content.replace(/\{error \? <ErrorText>\{error\}<\/ErrorText> : null\}\s*\r?\n?/g, () => {
    changed = true;
    return '';
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('errors->toast', path.relative(root, filePath));
  }
  return changed;
}

for (const file of walk(adminComponents)) fixFile(file);

// admin-form cleanup
const adminForm = path.join(adminComponents, 'ui/admin-form.tsx');
let form = fs.readFileSync(adminForm, 'utf8');
form = form.replace(/\s*const \[error, setError\] = useState<string \| null>\(null\);\r?\n/, '\n');
form = form.replace(/setError\(null\);\r?\n\s*/, '');
form = form.replace(/\{error \? <ErrorText>\{error\}<\/ErrorText> : null\}\s*\r?\n?/, '');
fs.writeFileSync(adminForm, form);
