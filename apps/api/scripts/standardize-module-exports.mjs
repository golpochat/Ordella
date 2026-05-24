import fs from 'fs';
import path from 'path';

const modulesRoot = path.resolve('src/modules');

const AUTH_EXPORTS = `exports: [JwtModule, JwtAuthGuard, RbacGuard]`;

function walkDir(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDir(p, files);
    else if (ent.name.endsWith('.module.ts')) files.push(p);
  }
  return files;
}

for (const file of walkDir(modulesRoot)) {
  let content = fs.readFileSync(file, 'utf8');
  const isAuthRoot = file.endsWith(`${path.sep}auth${path.sep}auth.module.ts`);
  const replacement = isAuthRoot ? AUTH_EXPORTS : 'exports: []';

  if (/\bexports\s*:/.test(content)) {
    content = content.replace(/exports:\s*\[[\s\S]*?\],/m, `${replacement},`);
  } else {
    content = content.replace(
      /@Module\(\{([\s\S]*?)\}\)/m,
      (match, body) => `@Module({${body}  ${replacement},\n})`,
    );
  }

  fs.writeFileSync(file, content);
}

console.log('Module exports standardized.');
