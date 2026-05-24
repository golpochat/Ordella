import fs from 'fs';
import path from 'path';

const modulesRoot = path.resolve('src/modules');
const DOMAIN_MODULES = [
  'auth',
  'tenants',
  'catalog',
  'inventory',
  'orders',
  'payments',
  'deliveries',
  'notifications',
  'integrations',
  'reports',
  'promotions',
];

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDir(p, files);
    else files.push(p);
  }
  return files;
}

function getExportedClass(content) {
  const m = content.match(/export\s+(?:abstract\s+)?class\s+(\w+)/);
  return m?.[1] ?? null;
}

function relImportPath(fromDir, targetFile) {
  const rel = path.relative(fromDir, targetFile).replace(/\\/g, '/');
  return rel.replace(/\.tsx?$/, '');
}

function generateEntityIndex(entitiesDir, domainName) {
  const files = fs
    .readdirSync(entitiesDir)
    .filter((f) => f.endsWith('.entity.ts'))
    .sort();

  const exports = [];
  const entityClasses = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(entitiesDir, file), 'utf8');
    const cls = getExportedClass(content);
    if (!cls) continue;
    const rel = `./${file.replace(/\.ts$/, '')}`;
    exports.push(`export { ${cls} } from '${rel}';`);
    if (/@Entity\s*\(/.test(content)) {
      entityClasses.push(cls);
    }
  }

  const constName = `${domainName.toUpperCase()}_ENTITIES`;
  const arrayImports = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(entitiesDir, file), 'utf8');
    const cls = getExportedClass(content);
    if (cls && /@Entity\s*\(/.test(content)) {
      arrayImports.push(`import { ${cls} } from './${file.replace(/\.ts$/, '')}';`);
    }
  }

  const body = [
    ...arrayImports,
    '',
    ...exports,
    '',
    `export const ${constName} = [`,
    ...entityClasses.map((c) => `  ${c},`),
    '];',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(entitiesDir, 'index.ts'), body);
}

function generateFlatBarrel(dir, pattern, exportSuffix) {
  if (!fs.existsSync(dir)) return null;
  const lines = [];
  const allFiles = walkDir(dir).filter((f) => {
    const base = path.basename(f);
    return pattern.test(base);
  });

  allFiles.sort((a, b) => a.localeCompare(b));

  for (const file of allFiles) {
    const rel = relImportPath(dir, file);
    lines.push(`export * from '${rel.startsWith('.') ? rel : './' + rel}';`);
  }

  if (lines.length === 0) return null;

  const indexPath = path.join(dir, 'index.ts');
  fs.writeFileSync(indexPath, `${lines.join('\n')}\n`);
  return indexPath;
}

for (const domain of DOMAIN_MODULES) {
  const domainRoot = path.join(modulesRoot, domain);
  if (!fs.existsSync(domainRoot)) continue;

  const entitiesDir = path.join(domainRoot, 'entities');
  if (fs.existsSync(entitiesDir)) {
    generateEntityIndex(entitiesDir, domain);
  }

  generateFlatBarrel(path.join(domainRoot, 'dto'), /\.dto\.ts$/, 'dto');
  generateFlatBarrel(path.join(domainRoot, 'services'), /\.service\.ts$/, 'service');
  generateFlatBarrel(path.join(domainRoot, 'controllers'), /\.controller\.ts$/, 'controller');
}

console.log('Barrel files generated.');
console.log('Run: node scripts/rewrite-barrel-imports.mjs');
