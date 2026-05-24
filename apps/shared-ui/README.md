# @ordella/shared-ui

Shared React UI primitives built with **Tailwind CSS** and **ShadCN-style** components (Radix + CVA).

## Setup in an app

```bash
npm install @shared-ui @shared-utils
```

```ts
// app entry or layout
import '@shared-ui/styles.css';
```

```js
// tailwind.config.ts
import preset from '@ordella/shared-ui/tailwind-preset';

export default {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../shared-ui/src/**/*.{ts,tsx}',
  ],
};
```

## Components

`Button`, `Input`, `Card`, `Table`, `Modal`, `Badge`, `Tabs`, `Sidebar`, `Topbar`

```tsx
import { Button, Card, CardHeader, CardTitle, Sidebar, Topbar } from '@shared-ui';
// npm package: @ordella/shared-ui — use @shared-ui via tsconfig paths in apps
```

## Subpath imports

TypeScript path mapping (root `tsconfig`):

```json
"@shared-ui/*": ["apps/shared-ui/src/*"]
```
