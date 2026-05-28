import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { cn } from '@/lib/cn';
import { Callout } from './callout';

function createHeading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  const className =
    level === 2
      ? 'text-h2 mt-10 scroll-mt-28 first:mt-0'
      : level === 3
        ? 'text-h3 mt-8 scroll-mt-28'
        : 'text-h4 mt-6 scroll-mt-28';

  return function Heading({ id, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
      <Tag id={id} className={cn(className, 'text-navy')} {...props}>
        {children}
      </Tag>
    );
  };
}

export const mdxComponents: MDXComponents = {
  h1: createHeading(2),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  p: ({ children, ...props }) => (
    <p className="text-body mt-4 first:mt-0" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="text-body mt-4 list-disc space-y-2 pl-6" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="text-body mt-4 list-decimal space-y-2 pl-6" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-slate [&>strong]:text-navy" {...props}>
      {children}
    </li>
  ),
  a: ({ href, children, ...props }) => {
    if (href?.startsWith('/')) {
      return (
        <Link href={href} className="font-medium text-primary hover:underline" {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary hover:underline"
        {...props}
      />
    );
  },
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-navy" {...props}>
      {children}
    </strong>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="text-body mt-4 border-l-4 border-primary/40 pl-4 italic text-slate"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className={cn('font-mono text-sm', className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-gray-light px-1.5 py-0.5 font-mono text-sm font-medium text-navy"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="mt-4 overflow-x-auto rounded-xl border border-border bg-navy p-4 text-sm text-gray-light"
      {...props}
    >
      {children}
    </pre>
  ),
  hr: () => <hr className="my-10 border-border" />,
  table: ({ children, ...props }) => (
    <Table className="mt-4 min-w-[480px] text-sm" {...props}>
      {children}
    </Table>
  ),
  thead: ({ children, ...props }) => (
    <TableHeader className="bg-gray-light text-left text-navy" {...props}>
      {children}
    </TableHeader>
  ),
  tbody: ({ children, ...props }) => <TableBody {...props}>{children}</TableBody>,
  tr: ({ children, ...props }) => <TableRow {...props}>{children}</TableRow>,
  th: ({ children, ...props }) => (
    <TableHead className="px-4 py-3 font-semibold" {...props}>
      {children}
    </TableHead>
  ),
  td: ({ children, ...props }) => (
    <TableCell className="px-4 py-3 text-slate" {...props}>
      {children}
    </TableCell>
  ),
  Callout,
};
