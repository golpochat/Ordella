import fs from 'node:fs';
import { globSync } from 'glob';

const pageFiles = globSync('apps/admin-ui/app/(dashboard)/**/page.tsx');

for (const file of pageFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('space-y-6')) continue;

  const updated = content.replace(
    /return \(\s*<div className="space-y-6">/,
    'return (\n    <>',
  );

  if (updated === content) continue;

  const final = updated.replace(/\n    <\/div>\n  \);\n\}/, '\n    </>\n  );\n}');
  fs.writeFileSync(file, final);
  console.log('updated', file);
}

const panelFiles = globSync('apps/admin-ui/components/**/*-panel.tsx');
for (const file of panelFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('className="space-y-6"')) continue;

  let updated = content.replace(
    /return \(\s*<div className="space-y-6">/,
    'return (\n    <Stack gap="lg" className="min-w-0">',
  );
  if (updated === content) continue;

  if (!updated.includes("from '@shared-ui'") && !updated.includes('Stack')) {
    updated = updated.replace(
      /^(import .+;\n)/m,
      "$1import { Stack } from '@shared-ui';\n",
    );
  } else if (updated.includes("from '@shared-ui'")) {
    updated = updated.replace(
      /from '@shared-ui';/,
      (match, offset) => {
        const line = updated.slice(0, offset).split('\n').pop();
        if (line && line.includes('Stack')) return match;
        return "import { Stack } from '@shared-ui';\n" + match;
      },
    );
  }

  updated = updated.replace(/\n    <\/div>\n  \);\n\}/, '\n    </Stack>\n  );\n}');
  fs.writeFileSync(file, updated);
  console.log('updated panel', file);
}
