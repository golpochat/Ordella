import fs from 'fs';
import path from 'path';

const modulesRoot = path.resolve('src/modules');
const commonDto = path.resolve('src/common/dto');

function walkDir(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDir(p, files);
    else if (p.endsWith('.ts')) files.push(p);
  }
  return files;
}

for (const file of walkDir(modulesRoot)) {
  if (!fs.readFileSync(file, 'utf8').includes('common/dto')) continue;
  const rel = path.relative(path.dirname(file), commonDto).replace(/\\/g, '/');
  const importPath = rel.startsWith('.') ? rel : `./${rel}`;
  let content = fs.readFileSync(file, 'utf8');
  const next = content.replace(/from\s+(['"])[^'"]*common\/dto\1/g, `from '$1${importPath}$1`.replace("$1$", "'"));
  // fix botched replace
  const fixed = content.replace(
    /from\s+(['"])[^'"]*common\/dto\1/g,
    (_, q) => `from ${q}${importPath}${q}`,
  );
  if (fixed !== content) fs.writeFileSync(file, fixed);
}

console.log('Common DTO import paths fixed.');
