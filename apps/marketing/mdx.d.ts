import type { ComponentProps, ComponentType, JSX } from 'react';

declare module 'mdx/types' {
  export type MDXComponents = {
    [K in keyof JSX.IntrinsicElements]?: ComponentType<ComponentProps<K>>;
  } & Record<string, ComponentType<Record<string, unknown>>>;
}
