import fs from 'fs';
import path from 'path';

const apiSrc = path.resolve('src');
const DOMAIN_MODULES =
  'auth|tenants|catalog|inventory|orders|payments|deliveries|notifications|integrations|reports|promotions';

function walkDir(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDir(p, files);
    else if (ent.name.endsWith('.ts')) files.push(p);
  }
  return files;
}

function rewriteImports(content) {
  let result = content.replace(
    /from\s+(['"])((?:\.\.\/)+)(?:(?:modules\/)?)(auth|tenants|catalog|inventory|orders|payments|deliveries|notifications|integrations|reports|promotions)\/(entities|dto|services|controllers)\/[^'"]+\.(entity|dto|service|controller)\1/g,
    (full, q, prefix, domain, kind) => {
      const hasModules = full.includes('/modules/');
      const base = hasModules ? `${prefix}modules/${domain}/${kind}` : `${prefix}${domain}/${kind}`;
      return `from ${q}${base}${q}`;
    },
  );

  result = result.replace(
    /from\s+(['"])((?:\.\.\/)+)(entities|dto|services|controllers)\/[^'"]+\.(entity|dto|service|controller)\1/g,
    (_, q, prefix, kind) => `from ${q}${prefix}${kind}${q}`,
  );

  return result;
}

for (const file of walkDir(apiSrc)) {
  const norm = file.replace(/\\/g, '/');
  if (/\/entities\/[^/]+\.entity\.ts$/.test(norm)) continue;

  let content = fs.readFileSync(file, 'utf8');
  const updated = rewriteImports(content);
  if (updated !== content) fs.writeFileSync(file, updated);
}

console.log('Barrel imports rewritten.');
