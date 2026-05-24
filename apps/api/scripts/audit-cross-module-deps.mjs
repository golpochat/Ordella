import fs from 'fs';
import path from 'path';

const modulesRoot = path.resolve('src/modules');
const apiSrc = path.resolve('src');

const DOMAINS =
  'auth|tenants|catalog|inventory|orders|payments|deliveries|notifications|integrations|reports|promotions';

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDir(p, files);
    else if (p.endsWith('.ts')) files.push(p);
  }
  return files;
}

function getDomain(filePath) {
  const m = filePath.replace(/\\/g, '/').match(/modules\/(auth|tenants|catalog|inventory|orders|payments|deliveries|notifications|integrations|reports|promotions)/);
  return m?.[1] ?? null;
}

function rewriteFile(content, filePath) {
  const norm = filePath.replace(/\\/g, '/');
  const fileDomain = getDomain(norm);

  // Shared pagination DTO — no longer owned by auth
  if (!norm.includes('/common/dto/')) {
    content = content.replace(
      /from\s+(['"])((?:\.\.\/)+)(?:modules\/)?auth\/dto\1/g,
      (_, q) => {
        const fromDir = path.dirname(filePath);
        const rel = path.relative(fromDir, path.join(apiSrc, 'common/dto')).replace(/\\/g, '/');
        const imp = rel.startsWith('.') ? rel : `./${rel}`;
        return `from ${q}${imp}${q}`;
      },
    );
  }

  // Auth guards/decorators → public barrels
  content = content.replace(
    /from\s+(['"])((?:\.\.\/)+)(?:modules\/)?auth\/guards\/[\w-]+\.guard\1/g,
    (_, q, prefix) => `from ${q}${prefix}auth/guards${q}`,
  );
  content = content.replace(
    /from\s+(['"])((?:\.\.\/)+)(?:modules\/)?auth\/decorators\/[\w-]+\.decorator\1/g,
    (_, q, prefix) => `from ${q}${prefix}auth/decorators${q}`,
  );

  // Prefer auth public index for cross-domain guard/decorator bundles
  if (fileDomain && fileDomain !== 'auth') {
    content = content.replace(
      /from\s+(['"])((?:\.\.\/)+)auth\/guards\1/g,
      (_, q, prefix) => `from ${q}${prefix}auth${q}`,
    );
    content = content.replace(
      /from\s+(['"])((?:\.\.\/)+)auth\/decorators\1/g,
      (_, q, prefix) => `from ${q}${prefix}auth${q}`,
    );
  }

  // Authenticated user → common/interfaces barrel
  if (!norm.endsWith('common/interfaces/index.ts')) {
    content = content.replace(
      /from\s+(['"])[^'"]*authenticated-user\.interface\1/g,
      (_, q) => {
        const fromDir = path.dirname(filePath);
        const rel = path.relative(fromDir, path.join(apiSrc, 'common/interfaces')).replace(/\\/g, '/');
        const imp = rel.startsWith('.') ? rel : `./${rel}`;
        return `from ${q}${imp}${q}`;
      },
    );
  }

  // Common deep imports → barrels
  content = content.replace(
    /from\s+(['"])((?:\.\.\/)+)common\/interfaces\/[\w-]+\.interface\1/g,
    (_, q, prefix) => `from ${q}${prefix}common/interfaces${q}`,
  );
  content = content.replace(
    /from\s+(['"])((?:\.\.\/)+)common\/decorators\/[\w-]+\.decorator\1/g,
    (_, q, prefix) => `from ${q}${prefix}common/decorators${q}`,
  );
  content = content.replace(
    /from\s+(['"])((?:\.\.\/)+)common\/guards\/[\w-]+\.guard\1/g,
    (_, q, prefix) => `from ${q}${prefix}common/guards${q}`,
  );
  content = content.replace(
    /from\s+(['"])((?:\.\.\/)+)common\/interfaces\/api-response\.interface\1/g,
    (_, q, prefix) => `from ${q}${prefix}common/interfaces${q}`,
  );

  // Permission keys seed
  content = content.replace(
    /from\s+(['"])[^'"]*modules\/auth\/constants\/permission-keys\1/g,
    (full, q) => {
      const fromDir = path.dirname(filePath);
      const rel = path.relative(fromDir, path.join(modulesRoot, 'auth/constants')).replace(/\\/g, '/');
      const imp = rel.startsWith('.') ? rel : `./${rel}`;
      return `from ${q}${imp}${q}`;
    },
  );

  // Intra-auth relative paths → barrels
  if (fileDomain === 'auth') {
    content = content.replace(
      /from\s+(['"])\.\.\/guards\/[\w-]+\.guard\1/g,
      "from '../guards'",
    );
    content = content.replace(
      /from\s+(['"])\.\.\/decorators\/[\w-]+\.decorator\1/g,
      "from '../decorators'",
    );
    content = content.replace(
      /from\s+(['"])\.\.\/interfaces\/authenticated-user\.interface\1/g,
      "from '../interfaces'",
    );
    content = content.replace(
      /from\s+(['"])\.\.\/decorators\/public\.decorator\1/g,
      "from '../decorators'",
    );
  }

  return content;
}

const violations = [];

for (const file of walkDir(apiSrc)) {
  const fileDomain = getDomain(file);
  let content = fs.readFileSync(file, 'utf8');
  const updated = rewriteFile(content, file);
  if (updated !== content) fs.writeFileSync(file, updated);
  content = updated;

  const imports = [...content.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  for (const imp of imports) {
    const crossDomain = imp.match(new RegExp(`(?:^|\\/)(${DOMAINS})\\/`));
    if (!crossDomain) continue;
    const targetDomain = crossDomain[1];
    if (!fileDomain || fileDomain === targetDomain) continue;

    if (/\/(controllers|services|repositories)\//.test(imp)) {
      violations.push({ file: path.relative(apiSrc, file), imp, reason: 'private-internal' });
    }
    if (/\/guards\/|\/decorators\/|\/strategies\//.test(imp) && !imp.endsWith('/guards') && !imp.endsWith('/decorators') && !imp.endsWith('/auth')) {
      violations.push({ file: path.relative(apiSrc, file), imp, reason: 'deep-auth-internal' });
    }
  }
}

if (violations.length) {
  console.error('Cross-module violations:\n', JSON.stringify(violations, null, 2));
  process.exit(1);
}

console.log('Cross-module dependency audit passed.');
