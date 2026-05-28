import fs from 'node:fs';
import { globSync } from 'glob';

const re = /\} import \{ Stack \} from '@shared-ui';\nfrom '@shared-ui';/g;

for (const file of globSync('apps/admin-ui/**/*.tsx')) {
  let content = fs.readFileSync(file, 'utf8');
  if (!re.test(content)) continue;
  content = content.replace(re, ", Stack } from '@shared-ui';");
  content = content.replace(/\nfrom '@shared-ui';\n/g, '\n');
  fs.writeFileSync(file, content);
  console.log('fixed', file);
}
