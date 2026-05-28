#!/usr/bin/env node
/**
 * Fixes common JSX issues from layout migration (Stack/fragment closings, broken Tag syntax).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue;
      walk(full, files);
    } else if (/\.tsx$/.test(name)) {
      files.push(full);
    }
  }
  return files;
}

function fixFile(path) {
  let content = readFileSync(path, 'utf8');
  let changed = false;

  if (content.includes('<>')) {
    const next = content.replace(/(\r?\n    )<\/div>(\r?\n  \);\r?\n\})/g, '$1</>$2');
    if (next !== content) {
      content = next;
      changed = true;
    }
  }

  if (content.includes('<Stack gap="lg"') && !/<\/Stack>\s*\r?\n\s*\);/.test(content)) {
    let next = content.replace(/      <\/div>\r?\n    \);/g, '      </Stack>\r\n    );');
    next = next.replace(/    <\/div>\r?\n  \);/g, '    </Stack>\r\n  );');
    if (next !== content) {
      content = next;
      changed = true;
    }
  }

  const tagFixes = [
    [
      /<Tag variant=\{row\.lag ><TagLabel> 100 \? 'error' : 'neutral'\}>\{row\.lag\}<\/TagLabel><\/Tag>/g,
      "<Tag variant={row.lag > 100 ? 'error' : 'neutral'}><TagLabel>{row.lag}</TagLabel></Tag>",
    ],
    [
      /<Tag variant=\{item\.riskScore ><TagLabel>= 70 \? 'error' : 'neutral'\}>\{item\.riskScore\}%<\/TagLabel><\/Tag>/g,
      "<Tag variant={item.riskScore >= 70 ? 'error' : 'neutral'}><TagLabel>{item.riskScore}%</TagLabel></Tag>",
    ],
    [/TableRow, , Stack/g, 'TableRow, Stack'],
    [/from '@shared-ui';\nimport type/g, "from '@shared-ui';\nimport { Stack } from '@shared-ui';\nimport type"],
  ];

  for (const [pattern, replacement] of tagFixes) {
    const next = content.replace(pattern, replacement);
    if (next !== content) {
      content = next;
      changed = true;
    }
  }

  if (
    content.includes('<Stack gap="lg"') &&
    !content.includes("Stack } from '@shared-ui'") &&
    !content.includes('Stack,') &&
    content.includes("from '@shared-ui'")
  ) {
    content = content.replace(
      /from '@shared-ui';/,
      (m, offset) => {
        const before = content.slice(0, offset);
        if (before.includes('Stack')) return m;
        return "import { Stack } from '@shared-ui';\n" + m;
      },
    );
    changed = true;
  }

  if (changed) {
    writeFileSync(path, content);
    return true;
  }
  return false;
}

const files = [...walk(join(root, 'app')), ...walk(join(root, 'components'))];
let count = 0;
for (const file of files) {
  if (fixFile(file)) {
    count++;
    console.log('fixed', file.replace(root + '\\', '').replace(root + '/', ''));
  }
}

console.log(`Done. ${count} files updated.`);
