import fs from 'fs';
import path from 'path';

const modulesRoot = path.resolve('src/modules');
const apiSrc = path.resolve('src');

/** [oldRel, newRel, oldClass, newClass] — extend when renaming legacy entities */
const fileRenames = [];

const classRenames = [];

function pascalFromKebab(s) {
  return s
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');
}

function walkDir(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDir(p, files);
    else files.push(p);
  }
  return files;
}

for (const [oldRel, newRel, oldClass, newClass] of fileRenames) {
  const oldPath = path.join(modulesRoot, oldRel);
  const newPath = path.join(modulesRoot, newRel);
  if (!fs.existsSync(oldPath)) continue;
  fs.mkdirSync(path.dirname(newPath), { recursive: true });
  let content = fs.readFileSync(oldPath, 'utf8');
  if (oldClass !== newClass) {
    content = content.replace(new RegExp(`\\b${oldClass}\\b`, 'g'), newClass);
  }
  fs.writeFileSync(newPath, content);
  fs.unlinkSync(oldPath);
}

for (const file of walkDir(apiSrc)) {
  if (!file.endsWith('.ts')) continue;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [oldClass, newClass] of classRenames) {
    content = content.replace(new RegExp(`\\b${oldClass}\\b`, 'g'), newClass);
  }
  if (content !== original) fs.writeFileSync(file, content);
}

const issues = [];

for (const f of walkDir(modulesRoot)) {
  if (!f.includes(`${path.sep}entities${path.sep}`) || !f.endsWith('.entity.ts')) continue;
  const base = path.basename(f, '.entity.ts');
  const expected = `${pascalFromKebab(base)}Entity`;
  const content = fs.readFileSync(f, 'utf8');
  const m = content.match(/export\s+(?:abstract\s+)?class\s+(\w+)/);
  if (!m) {
    issues.push({ type: 'no-class', file: path.relative(modulesRoot, f) });
    continue;
  }
  if (m[1] !== expected) {
    issues.push({
      type: 'name-mismatch',
      file: path.relative(modulesRoot, f),
      expected,
      actual: m[1],
    });
  }
}

for (const f of walkDir(apiSrc)) {
  if (!f.endsWith('.ts')) continue;
  const content = fs.readFileSync(f, 'utf8');
  for (const m of content.matchAll(/from\s+['"]([^'"]*entities\/[^'"]+)['"]/g)) {
    const imp = m[1];
    if (!imp.endsWith('.entity')) {
      issues.push({
        type: 'import-missing-suffix',
        file: path.relative(apiSrc, f),
        import: imp,
      });
    }
  }
}

if (issues.length > 0) {
  console.error('Entity standardization issues:\n', JSON.stringify(issues, null, 2));
  process.exit(1);
}

console.log('All entity files and imports match naming conventions.');
